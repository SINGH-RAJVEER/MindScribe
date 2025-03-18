const express = require("express");
const cors = require("cors");
const { chatbotRouter } = require("./chatbot");
const { authRouter } = require("./auth");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/chat", chatbotRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to MindScribe" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
