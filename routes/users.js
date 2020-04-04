const router = require("express").Router();
const {
  getAllUsers,
  signup,
  login,
  uploadProfileImage
} = require("../functions/userFunctions");

// Routes

router.route("/").get(getAllUsers);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/profile").post(uploadProfileImage);

module.exports = router;
