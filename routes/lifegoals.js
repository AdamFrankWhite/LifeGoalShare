const router = require("express").Router();

const verifyToken = require("../functions/verifyToken");
const {
  getLifeGoals,
  addLifeGoal,
  deleteLifeGoal,
  followLifeGoal,
} = require("../functions/lifegoalFunctions");

// Routes
router.route("/").get(getLifeGoals);
router.route("/add").post(addLifeGoal);
router.route("/delete/:id").delete(deleteLifeGoal);
router.route("/follow").post(verifyToken, followLifeGoal);
module.exports = router;
