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
  getSpecificUsers,
  sendMessage,
  deleteMessage,
  getMessages,
  getUserComments,
  fileUpload,
} = require("../functions/userFunctions");

const verifyToken = require("../functions/verifyToken");
const multer = require("multer");
const ProfileImageUpload = createProfileImageUpload().single("file");

// Routes

//GET
router.route("/").get(verifyToken, getAllUsers);
router.route("/profile/get").get(verifyToken, getAuthenticatedUser);
router.route("/getusers").get(verifyToken, getSpecificUsers);
// router.route("/profile/files/:filename").get(verifyToken, getProfileImageFile);
// router.route("/profile/image/:filename").get(verifyToken, showImageFile);
router.route("/comments").get(verifyToken, getUserComments);
// router.route("/messages").get(verifyToken, getMessages);

//PUT

router.route("/profile/update").put(verifyToken, updateUserDetails);

//POST
router.route("/profile/upload").post(verifyToken, fileUpload);

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/profile/update/img").post(verifyToken, setProfileImage);
router
  .route("/profile")
  .post(verifyToken, ProfileImageUpload, uploadProfileImage);
// router.route("/message/send").post(verifyToken, sendMessage);
router.route("/message/delete").delete(verifyToken, deleteMessage);

module.exports = router;

// TODO - userverification w/ token, check user-restricted
