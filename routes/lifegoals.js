const router = require("express").Router();

const verifyToken = require("../functions/verifyToken");
const {
  getLifeGoals,
  addLifeGoal,
  deleteLifeGoal,
  followLifeGoal,
  postNewComment,
  unfollowLifeGoal,
  deleteComment,
  getLifeGoalComments,
  editComment,
  getSingleComment,
  addNewPost,
} = require("../functions/lifegoalFunctions");

// Routes
router.route("/").get(verifyToken, getLifeGoals);
router.route("/add").post(verifyToken, addLifeGoal);
router.route("/post/add").post(verifyToken, addNewPost);
router.route("/delete").delete(verifyToken, deleteLifeGoal);
router.route("/follow").post(verifyToken, followLifeGoal);
router.route("/unfollow").delete(verifyToken, unfollowLifeGoal);
router.route("/comment/get").get(verifyToken, getSingleComment);
router.route("/comment/post").post(verifyToken, postNewComment);
router.route("/comment/delete").delete(verifyToken, deleteComment);
router.route("/comments").get(verifyToken, getLifeGoalComments);
router.route("/comment/edit").put(verifyToken, editComment);
module.exports = router;
