const router = require("express").Router();
const {
  getAllUsers,
  signup,
  login,
  createProfileImageUpload,
  uploadProfileImage,
  getProfileImageFile,
  showImageFile
} = require("../functions/userFunctions");

const multer = require("multer");

// Routes

router.route("/").get(getAllUsers);
router.route("/signup").post(signup);
router.route("/login").post(login);
router
  .route("/profile")
  .post(createProfileImageUpload().single("file"), uploadProfileImage);
router.route("/profile/files/:filename").get(getProfileImageFile);
router.route("/profile/image/:filename").get(showImageFile);

module.exports = router;
