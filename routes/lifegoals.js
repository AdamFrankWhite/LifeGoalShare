const router = require("express").Router();
const LifeGoal = require("../models/lifegoal.model");

router.route("/add").post((req, res) => {
  const { lifeGoalName, lifeGoalDescription, createdBy } = req.body;
  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy
  });
  console.log(lifeGoal);
  lifeGoal
    .save()
    .then(() => res.json("Life Goal Added"))
    .catch(err => res.status(400).json("Error:" + err));
});

module.exports = router;
