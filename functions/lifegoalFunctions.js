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
  let newLifeGoalID;
  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy,
    followers,
  });
  lifeGoal
    .save()
    .then((data) => {
      console.log(data);
      lifeGoalID = data._id;
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
      // console.log({ message: "you have done something lifegoal", authData });
      loggedInUser = authData.user.username;
      // TODO --- if lifegoal deleted, leave history of it?
    }
  });
  // Find lifegoal
  LifeGoal.findById(req.params.id)
    // TODO: Error handle not found
    .then((lifegoal) => {
      console.log(lifegoal.createdBy, loggedInUser);
      lifeGoalCreator = lifegoal.createdBy;
    })
    .then((data) => {
      //Check if lifegoal was created by user. If so, delete
      if (loggedInUser == lifeGoalCreator) {
        console.log("hello");
        LifeGoal.findByIdAndDelete(req.params.id)
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
  if (lifeGoalID && userID && comment) {
    let userComment = [
      {
        userID: userID,
        commentID: commentID,
        comment: comment,
        replies: [],
        createdAt: new Date(),
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
      createdAt: new Date(),
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
  const myReply = {
    userID,
    lifeGoalID,
    commentID,
    replyID,
    reply,
    createdAt: new Date(),
  };

  LifeGoal.findOneAndUpdate(
    { _id: lifeGoalID },
    { "comments.replies.$addToSet": myReply }, // TOCHANGE

    { new: true },
    (err, user) => {
      if (err) {
        res.json(err);
      }
      // else {
      //   res.json(user);
      // }
      // TRY ADDING ERROR TO OBJECT, THEN PASS ERROR OBJECY IN FINAL RES
    }
  );

  User.findOneAndUpdate(
    { _id: userID },
    { $addToSet: { myComments: { replyID, createdAt: new Date() } } },
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

exports.editComment = (req, res) => {};
//TODO - followLifeGoal - add ref to users, add follower to lifeGoal - which router to place in? DONE
// TODO - addLifeGoal - add ref to users DONE
//TODO - addComment, deleteComment

// TODO - deleteLifeGoal - delete ref to users
//TODO - FRONT END - socket.io to listen for changes to data, e.g. if logged in and another user updates goal or comments/messages you
