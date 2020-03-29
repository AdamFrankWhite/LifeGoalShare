const router = require("express").Router();
const LifeGoal = require("../models/lifegoal.model");
const jwt = require("jsonwebtoken");

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

router.route("/delete/:id").delete((req, res) => {
  let loggedInUser = "";
  let lifeGoalCreator = "";
  jwt.verify(req.headers.authorization, "secret_key", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      // console.log({ message: "you have done something lifegoal", authData });
      loggedInUser = authData.user.username;
      console.log(loggedInUser);
    }
  });
  // console.log(LifeGoal.findById(req.params.id));
  LifeGoal.findById(req.params.id)
    .then(lifegoal => {
      console.log(lifegoal.createdBy, loggedInUser);
      lifeGoalCreator = lifegoal.createdBy;
    })
    .then(data => {
      if (loggedInUser == lifeGoalCreator) {
        console.log("hello");
        LifeGoal.findByIdAndDelete(req.params.id)
          .exec()
          .then(lifegoal =>
            res.json(`"${lifegoal.lifeGoalName}" has been deleted`)
          )
          .catch(err => res.json(err));
      } else {
        res.json("Access denied");
      }
    });
});

module.exports = router;
