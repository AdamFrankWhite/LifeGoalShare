const LifeGoal = require("../models/lifegoal.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const randomID = mongoose.Types.ObjectId();

exports.getLifeGoals = (req, res) => {
  LifeGoal.find()
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json("Error: " + error));
};

exports.addLifeGoal = (req, res) => {
  const { lifeGoalName, lifeGoalDescription, createdBy, followers } = req.body;

  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy,
    followers,
  });
  lifeGoal
    .save()
    .then((data) => {
      lifeGoalID = data._id.toString();
      console.log(lifeGoalID);
      addToOwnLifeGoals();
      // res.json(data)
    })
    .catch((err) => res.status(400).json("Error:" + err));

  //Update User's ownLifeGoals (function avoids async issues)

  function addToOwnLifeGoals() {
    let newLifeGoalData = {
      lifeGoalID,
      createdOn: new Date(),
    };
    User.findOneAndUpdate(
      { _id: createdBy },
      { $addToSet: { ownLifeGoals: newLifeGoalData } },
      { new: true },
      (err, user) => {
        if (err) {
          res.json(err);
        } else res.json(user);
      }
    );
  }
};

exports.deleteLifeGoal = (req, res) => {
  // Grab username from JWT
  let loggedInUser = "";
  // Grab lifegoal createdBy value
  let lifeGoalCreator = "";
  jwt.verify(req.headers.authorization, "secret_key", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      loggedInUser = authData.user._id;
      // TODO --- if lifegoal deleted, leave history of it?
    }
  });
  const { lifeGoalID } = req.params.id;
  User.findOneAndUpdate(
    { _id: lifeGoalID },
    { $pull: { ownLifeGoals: { lifeGoalID: lifeGoalID } } },
    { new: true },
    (err, user) => {
      if (err) {
        res.json(err);
      }
      // else {
      //   res.json(user);
      // }
    }
  );

  // Find lifegoal
  LifeGoal.findOne({ lifeGoalID })
    // TODO: Error handle not found
    .then((lifegoal) => {
      lifeGoalCreator = lifegoal.createdBy;
    })
    .then((data) => {
      //Check if lifegoal was created by user. If so, delete
      if (loggedInUser == lifeGoalCreator) {
        LifeGoal.findOneAndDelete({ lifeGoalID })
          .exec()
          .then((lifegoal) =>
            res.json(`"${lifegoal.lifeGoalName}" has been deleted`)
          )
          .catch((err) => res.json(err));
      } else {
        res.json("Access denied");
      }
    });
};

exports.followLifeGoal = (req, res) => {
  const { userID, lifeGoalID } = req.body;
  let followLifeGoalData = {
    lifeGoalID,
    dateFollowed: new Date(),
  };
  // Add follow ref to UserData
  User.findOneAndUpdate(
    { _id: userID },
    { $addToSet: { lifeGoalsFollowed: followLifeGoalData } },
    { new: true },
    (err) => {
      if (err) {
        res.json(err);
      }
    }
  );
  // Add follower to lifeGoal
  let followerData = {
    followerID: userID,
    dateFollowed: new Date(),
  };
  LifeGoal.findOneAndUpdate(
    { _id: lifeGoalID },
    { $addToSet: { followers: followerData } },
    { new: true },
    (err, lifeGoal) => {
      if (err) {
        res.json(err);
      } else {
        res.json(lifeGoal);
      }
    }
  );
};

//Add comment

exports.postNewComment = (req, res) => {
  const { lifeGoalID, userID, comment } = req.body;
  const commentID = randomID;
  const newDate = new Date();
  if (lifeGoalID && userID && comment) {
    let userComment = [
      {
        userID: userID,
        commentID: commentID,
        comment: comment,
        createdAt: newDate,
      },
    ];

    LifeGoal.findOneAndUpdate(
      { _id: lifeGoalID },
      { $addToSet: { comments: userComment } },
      { new: true },
      (err, lifeGoal) => {
        if (err) {
          res.json(err);
        }

        // else {
        //   res.json(lifeGoal);
        // }
      }
    );

    let myComment = {
      commentID: commentID,
      createdAt: newDate,
    };

    User.findOneAndUpdate(
      { _id: userID },
      { $addToSet: { myComments: myComment } },
      { new: true },
      (err, user) => {
        if (err) {
          res.json(err);
        } else {
          res.json(user);
        }
      }
    );
  }
};

exports.postCommentReply = (req, res) => {
  //TODO
  const { userID, lifeGoalID, commentID, reply } = req.body;
  const replyID = randomID;
  const newDate = new Date();
  const myReply = {
    userID,
    // lifeGoalID,
    repliedToComment: commentID,
    replyID,
    reply,
    createdAt: new Date(),
  };

  LifeGoal.findOneAndUpdate(
    { _id: lifeGoalID },
    { $addToSet: { comments: myReply } }, // TOCHANGE

    (err, user) => {
      if (err) {
        res.json(err);
      }
      // TRY ADDING ERROR TO OBJECT, THEN PASS ERROR OBJECY IN FINAL RES
    }
  );
  User.findOneAndUpdate(
    { _id: userID },
    { $addToSet: { myComments: { replyID, createdAt: newDate } } },
    { new: true },
    (err, user) => {
      if (err) {
        res.json(err);
      } else {
        res.json(user);
      }
    }
  );
};
exports.getComments = (req, res) => {};
exports.editComment = (req, res) => {};
exports.deleteComment = (req, res) => {};
exports.unfollowLifeGoal = (req, res) => {};
//TODO - followLifeGoal - add ref to users, add follower to lifeGoal - which router to place in? DONE
// TODO - addLifeGoal - add ref to users DONE
//TODO - addComment, deleteComment

// TODO - deleteLifeGoal - delete ref to users
//TODO - FRONT END - socket.io to listen for changes to data, e.g. if logged in and another user updates goal or comments/messages you
