const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const postController = require("../controller/PostController");
const { authMiddleware } = require("../middlewares/authMiddleware");

//User router
router.post("/signup", authController.signup);
router.post("/login", authController.login);

//Post router
router.post(
  "/upload",
  authMiddleware,
  postController.uploadMiddleware,
  postController.upload
);
router.get("/listByUserEmail", authMiddleware, postController.listByUserEmail);
router.get("/download", authMiddleware, postController.download);
router.get("/findbyPostID", authMiddleware, postController.findbyPostID);
router.get("/getFileUrl", authMiddleware, postController.getFileUrl);
module.exports = router;
