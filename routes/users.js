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

const verifyToken = require("../functions/verifyToken");
const multer = require("multer");

// Routes

router.route("/").get(verifyToken, getAllUsers);
router.route("/signup").post(signup);
router.route("/login").post(login);
router
  .route("/profile")
  .post(
    verifyToken,
    createProfileImageUpload().single("file"),
    uploadProfileImage
  );
router.route("/profile/files/:filename").get(verifyToken, getProfileImageFile);
router.route("/profile/image/:filename").get(verifyToken, showImageFile);

module.exports = router;
