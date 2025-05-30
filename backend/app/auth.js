const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("./database");
const { SECRET_KEY, ALGORITHM } = require("./config");
const { body, validationResult } = require("express-validator");

// Create JWT token
const createJwtToken = (payload) => {
  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
  return jwt.sign({ ...payload, exp }, SECRET_KEY, { algorithm: ALGORITHM });
};

// Middleware to verify token
const getCurrentUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
    req.user = { id: decoded.user_id };
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
};

// POST /auth/register
router.post("/register",
  async (req, res) => {
    const { username, email, password } = req.body;
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
      if (err) return res.status(500).json({ detail: err.message });
      if (row) return res.status(400).json({ detail: "Email already registered" });

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ detail: err.message });
        db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hash],
          function(err) {
            if (err) return res.status(400).json({ detail: "Username already exists" });
            res.json({ message: "User registered successfully" });
          }
        );
      });
    });
  }
);

// POST /auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT id, username, password FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).json({ detail: err.message });
    if (!row) return res.status(401).json({ detail: "Invalid email or password" });

    bcrypt.compare(password, row.password, (err, result) => {
      if (err || !result) return res.status(401).json({ detail: "Invalid email or password" });
      const token = createJwtToken({ user_id: row.id });
      res.json({
        access_token: token,
        token_type: "bearer",
        user: { id: row.id, username: row.username, email }
      });
    });
  });
});

module.exports = { authRouter: router, getCurrentUser };
