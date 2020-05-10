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
  deletePost,
  getUserLifeGoals,
  commentOnPost,
  getFollowers,
} = require("../functions/lifegoalFunctions");

// Routes
router.route("/").get(getLifeGoals);

router.route("/followers").get(getFollowers);
router.route("/:id").get(verifyToken, getUserLifeGoals);
// Add getFollowedLifeGoals
router.route("/add").post(verifyToken, addLifeGoal);
router.route("/post/add").post(verifyToken, addNewPost);
router.route("/post/delete").put(verifyToken, deletePost);
router.route("/delete").delete(verifyToken, deleteLifeGoal);
router.route("/follow").post(verifyToken, followLifeGoal);
router.route("/unfollow").delete(verifyToken, unfollowLifeGoal);
router.route("/comment/get").get(verifyToken, getSingleComment);
router.route("/comment/new").post(verifyToken, postNewComment);
router.route("/comment/delete").put(verifyToken, deleteComment);
router.route("/comments").get(verifyToken, getLifeGoalComments);
router.route("/comment/edit").put(verifyToken, editComment);
router.route("/post/comment").post(verifyToken, commentOnPost);
module.exports = router;
