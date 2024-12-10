const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./router/authRoutes");
const { authMiddleware } = require("./middlewares/authMiddleware");

const app = express();
const PORT = 5004;

app.use(bodyParser.json());
app.use(cors());

app.use("/api", authRoutes);

app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.user.email}!` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
