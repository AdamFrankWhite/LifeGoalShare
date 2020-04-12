const router = require("express").Router();

const verifyToken = require("../functions/verifyToken");
const {
  getLifeGoals,
  addLifeGoal,
  deleteLifeGoal,
  followLifeGoal,
  postNewComment,
  postCommentReply,
} = require("../functions/lifegoalFunctions");

// Routes
router.route("/").get(getLifeGoals);
router.route("/add").post(addLifeGoal);
router.route("/delete").delete(deleteLifeGoal);
router.route("/follow").post(verifyToken, followLifeGoal);
router.route("/comment/post").post(verifyToken, postNewComment);
router.route("/comment/reply").post(verifyToken, postCommentReply);
module.exports = router;
