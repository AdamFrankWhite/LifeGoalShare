const router = require("express").Router();
const {
  getLifeGoals,
  addLifeGoal,
  deleteLifeGoal
} = require("../functions/lifegoalFunctions");

// Routes
router.route("/").get(getLifeGoals);
router.route("/add").post(addLifeGoal);
router.route("/delete/:id").delete(deleteLifeGoal);

module.exports = router;
