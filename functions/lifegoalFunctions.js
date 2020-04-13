const LifeGoal = require("../models/lifegoal.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getLifeGoals = (req, res) => {
  LifeGoal.find()
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json("Error: " + error));
};

exports.addLifeGoal = (req, res) => {
  const { lifeGoalName, lifeGoalDescription, createdBy, followers } = req.body;
  let lifeGoalID;
  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy,
    followers,
  });
  lifeGoal
    .save()
    .then((data) => {
      lifeGoalID = data._id;
      console.log(typeof lifeGoalID);
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
  const { userID, lifeGoalID } = req.body;
  User.findOneAndUpdate(
    { _id: new ObjectId(userID) },
    { $pull: { ownLifeGoals: { lifeGoalID: new ObjectId(lifeGoalID) } } }, // Works, what apart exec delete?
    { safe: true },
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
  LifeGoal.findOne({ _id: lifeGoalID })
    // TODO: Error handle not found
    .then((lifegoal) => {
      lifeGoalCreator = lifegoal.createdBy;
      console.log("boo");
    })
    .then((data) => {
      //Check if lifegoal was created by user. If so, delete
      if (loggedInUser == lifeGoalCreator) {
        console.log("boo2");
        LifeGoal.findOneAndDelete({ _id: lifeGoalID })
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

exports.unfollowLifeGoal = (req, res) => {
  //Update UserData

  const { followerID, lifeGoalID } = req.body;
  User.findOneAndUpdate(
    { _id: new ObjectId(followerID) },
    { $pull: { lifeGoalsFollowed: { lifeGoalID: lifeGoalID } } }, // Works, what apart exec delete?
    { safe: true },
    (err, user) => {
      if (err) {
        res.json(err);
      }
      // else {
      //   res.json(user);
      // }
    }
  );

  // Update lifegoal
  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID) }, // To be clear ======> When querying main collection with id, it needs to be an object. However, if you created ids, then string is to be expected
    { $pull: { followers: { followerID: followerID } } },
    { safe: true },
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
  const { lifeGoalID, userID, comment, parentComments } = req.body;
  const commentID = new ObjectId().toString();
  const newDate = new Date();
  if (lifeGoalID && userID && comment) {
    let userComment = {
      commentID: commentID,
      author: userID,
      comment: comment,
      parents: !parentComments ? [] : parentComments,
      createdAt: newDate,
    };

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

exports.deleteComment = (req, res) => {
  //Update UserData

  const { userID, commentID, lifeGoalID } = req.body;
  User.findOneAndUpdate(
    { _id: new ObjectId(userID) },
    { $pull: { myComments: { commentID: commentID } } },
    { safe: true },
    (err, user) => {
      if (err) {
        res.json(err);
      }
      // else {
      //   res.json(user);
      // }
    }
  );

  // Update lifegoal
  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID) }, // To be clear ======> When querying main collection with id, it expects to be an object, as that is what your Schema is set to create. However, if you created ids, then string is to be expected. Pay attention to the method of id creation!
    { $pull: { comments: { commentID: commentID } } },
    { safe: true },
    (err, lifeGoal) => {
      if (err) {
        res.json(err);
      } else {
        res.json(lifeGoal);
      }
    }
  );
};

exports.postCommentReply = (req, res) => {
  const { lifeGoalID, userID, commentID, comment, commentLevel } = req.body;
  const newCommentID = new ObjectId().toString();
  const newDate = new Date();
  if (lifeGoalID && userID && comment) {
    let userReply = {
      userID: userID,
      commentID: newCommentID,
      comment: comment,
      commentLevel: commentLevel,
      createdAt: newDate,
      replies: [],
    };

    LifeGoal.findOneAndUpdate(
      { _id: new ObjectId(lifeGoalID), "comments.commentID": commentID },
      { $addToSet: { "comments.$.replies": userReply } },
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

    let myReply = {
      commentID: newCommentID,
      createdAt: newDate,
    };

    User.findOneAndUpdate(
      { _id: new ObjectId(userID), "myComments.commentID": commentID },
      { $addToSet: { "myComments.$.replies": myReply } },
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
exports.getComments = (req, res) => {};
exports.editComment = (req, res) => {};
//TODO - followLifeGoal - add ref to users, add follower to lifeGoal - which router to place in? DONE
// TODO - addLifeGoal - add ref to users DONE
//TODO - addComment, deleteComment

// TODO - deleteLifeGoal - delete ref to users
//TODO - FRONT END - socket.io to listen for changes to data, e.g. if logged in and another user updates goal or comments/messages you
