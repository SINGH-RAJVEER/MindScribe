const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { SECRET_KEY, ALGORITHM } = require("./config");
const { body, validationResult } = require("express-validator");
const User = require("./models/User");

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
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ detail: "Email already registered" });
      const hash = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hash });
      await user.save();
      res.json({ message: "User registered successfully" });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ detail: "Username or email already exists" });
      }
      return res.status(500).json({ detail: err.message });
    }
  }
);

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ detail: "Invalid email or password" });
    const result = await bcrypt.compare(password, user.password);
    if (!result) return res.status(401).json({ detail: "Invalid email or password" });
    const token = createJwtToken({ user_id: user._id });
    res.json({
      access_token: token,
      token_type: "bearer",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = { authRouter: router, getCurrentUser };
