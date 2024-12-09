// const express = require("express");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const bodyParser = require("body-parser");
// const cors = require("cors");

// const app = express();
// const PORT = 5004;

// app.use(bodyParser.json());
// app.use(cors());

// const users = [];

// // Signup router
// app.post("/signup", async (req, res) => {
//   const { email, password } = req.body;
//   const userExists = users.find((user) => user.email === email);

//   if (userExists) {
//     return res.status(400).json({ message: "User already exists!" });
//   }

//   // haspassword
//   const hashedPassword = await bcrypt.hash(password, 10);
//   console.log("hashedPassword :", hashedPassword);

//   users.push({ email, password: hashedPassword });
//   res.status(201).json({
//     message: "Signup successful!",
//     // hashedPassword: `${hashedPassword}`,
//   });
// });

// // Secret
// const SECRET = "secret_key_test";

// // Login router
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = users.find((user) => user.email === email);

//   if (!user) {
//     return res.status(400).json({ message: "User not found!" });
//   }

//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) {
//     return res.status(400).json({ message: "Invalid credentials!" });
//   }

//   // JWT token
//   const token = jwt.sign({ email: user.email }, SECRET, {
//     expiresIn: "1h",
//   });
//   res.status(200).json({ message: "Login successful!", token });
// });

// // Route bảo vệ
// app.get("/dashboard", (req, res) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Authorization token missing!" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded_token = jwt.verify(token, SECRET);
//     res.status(200).json({ message: `Welcome, ${decoded_token.email}!` });
//   } catch (error) {
//     res.status(401).json({ message: "Invalid or expired token!" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./router/authRoutes");
const { authMiddleware } = require("./middlewares/authMiddleware");

const app = express();
const PORT = 5004;

app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api", authRoutes);

// Protected route example
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.user.email}!` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
