const router = require("express").Router();
const LifeGoal = require("../models/lifegoal.model");

router.route("/").get((req, res) => {
  LifeGoal.find()
    .then(data => res.json(data))
    .catch(error => res.status(400).json("Error: " + error));
});

router.route("/add").post((req, res) => {
  const { lifeGoalName, lifeGoalDescription, createdBy, followers } = req.body;
  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy,
    followers
  });
  lifeGoal
    .save()
    .then(data => res.json(data))
    .catch(err => res.status(400).json("Error:" + err));
});

module.exports = router;
