const jwt = require("jsonwebtoken");
const SECRET = "secret_key_test";

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing!" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // Gắn thông tin user vào request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token!" });
  }
};
