const router = require("express").Router();
const {
  getAllUsers,
  signup,
  login,
  createProfileImage,
  uploadProfileImage
} = require("../functions/userFunctions");

const multer = require("multer");

// Routes

router.route("/").get(getAllUsers);
router.route("/signup").post(signup);
router.route("/login").post(login);
router
  .route("/profile")
  .post(createProfileImage().single("file"), uploadProfileImage);

module.exports = router;
