const router = require("express").Router();
const {
  getAllUsers,
  signup,
  login,
  createProfileImageUpload,
  uploadProfileImage,
  getProfileImageFile,
  showImageFile,
  updateUserDetails,
  setProfileImage,
  getAuthenticatedUser,
} = require("../functions/userFunctions");

const verifyToken = require("../functions/verifyToken");
const multer = require("multer");
const ProfileImageUpload = createProfileImageUpload().single("file");

// Routes

router.route("/").get(verifyToken, getAllUsers);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/profile/update").post(verifyToken, updateUserDetails);
router.route("/profile/update/img").post(verifyToken, setProfileImage);
router
  .route("/profile")
  .post(verifyToken, ProfileImageUpload, uploadProfileImage);
router.route("/profile/get").get(verifyToken, getAuthenticatedUser);
router.route("/profile/files/:filename").get(verifyToken, getProfileImageFile);
router.route("/profile/image/:filename").get(verifyToken, showImageFile);

module.exports = router;
