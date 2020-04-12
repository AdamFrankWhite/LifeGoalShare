const router = require("express").Router();

const verifyToken = require("../functions/verifyToken");
const {
  getLifeGoals,
  addLifeGoal,
  deleteLifeGoal,
  followLifeGoal,
  postNewComment,
  postCommentReply,
  unfollowLifeGoal,
  deleteComment,
} = require("../functions/lifegoalFunctions");

// Routes
router.route("/").get(verifyToken, getLifeGoals);
router.route("/add").post(verifyToken, addLifeGoal);
router.route("/delete").delete(verifyToken, deleteLifeGoal);
router.route("/follow").post(verifyToken, followLifeGoal);
router.route("/unfollow").post(verifyToken, unfollowLifeGoal);
router.route("/comment/post").post(verifyToken, postNewComment);
router.route("/comment/delete").post(verifyToken, deleteComment);
router.route("/comment/post/reply").post(verifyToken, postCommentReply);
module.exports = router;
