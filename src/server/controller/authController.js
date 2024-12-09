const jwt = require("jsonwebtoken");
const User = require("../model/User");
const SECRET = "secret_key_test";

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const userExists = User.findUser(email);

  if (userExists) {
    return res.status(400).json({ message: "User already exists!" });
  }

  const newUser = await User.createUser(email, password);
  res.status(201).json({ message: "Signup successful!", user: newUser });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = User.findUser(email);

  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  const isMatch = await User.validatePassword(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1h" });
  res.status(200).json({ message: "Login successful!", token });
};
