const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const postController = require("../controller/PostController");

//User router
router.post("/signup", authController.signup);
router.post("/login", authController.login);

//Post router
router.post("/upload", postController.upload);
module.exports = router;
