const router = require("express").Router();
const verifyToken = require("../functions/verifyToken");
const {
  sendMessage,
  deleteMessage,
  getMessages,
} = require("../functions/messageFunctions");

router.route("/send").post(verifyToken, sendMessage);
router.route("/delete").delete(verifyToken, deleteMessage);
router.route("/get").get(verifyToken, getMessages);

module.exports = router;
