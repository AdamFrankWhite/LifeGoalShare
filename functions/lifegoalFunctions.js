const LifeGoal = require("../models/lifegoal.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const verifyUser = require("./verifyUser");

exports.getLifeGoals = (req, res) => {
  console.log(req.currentUser);
  LifeGoal.find()
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json("Error: " + error));
};

exports.addLifeGoal = (req, res) => {
  const {
    lifeGoalName,
    lifeGoalDescription,
    createdBy,
    followers,
    initialPostData,
  } = req.body;

  const initialPost = {
    postID: new ObjectId(),
    postName: initialPostData.postName,
    postContent: initialPostData.postContent,
    createdBy: createdBy,
    createdAt: new Date(),
    comments: [],
    postHeaderImage: initialPostData.postHeaderImage
      ? initialPostData.postHeaderImage
      : "PLACEHOLDER_HEADER_IMG",
  };

  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy,
    followers,
    posts: [initialPost],
  });
  lifeGoal
    .save()
    .then((data) => {
      let lifeGoalID = data._id;
      console.log(typeof lifeGoalID);
      addToOwnLifeGoals(lifeGoalID);
      // res.json(data)
    })
    .catch((err) => res.status(400).json("Error:" + err));

  //Update User's ownLifeGoals (function avoids async issues)

  function addToOwnLifeGoals(lifeGoalID) {
    let newLifeGoalData = {
      lifeGoalID: lifeGoalID,
      createdOn: new Date(),
    };
    User.findOneAndUpdate(
      { _id: createdBy },
      {
        $addToSet: {
          ownLifeGoals: newLifeGoalData,
          posts: {
            postID: initialPost.postID,
            createdAt: initialPost.createdAt,
          },
        },
      },
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

  let loggedInUser = req.currentUser;
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
  let lifeGoalCreator = "";

  // Find lifegoal
  LifeGoal.findOne({ _id: lifeGoalID })
    // TODO: Error handle not found
    .then((lifegoal) => {
      lifeGoalCreator = lifegoal.createdBy;
    })
    .then((data) => {
      //Check if lifegoal was created by user. If so, delete

      if (loggedInUser == lifeGoalCreator) {
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

exports.addNewPost = (req, res) => {
  const { userID, lifeGoalID, postData } = req.body;
  const newDate = new Date();
  const newPost = {
    postID: new ObjectId(),
    postName: postData.postName,
    postContent: postData.postContent,
    createdBy: userID,
    createdAt: newDate,
    comments: [],
    postHeaderImage: postData.postHeaderImage
      ? postData.postHeaderImage
      : "PLACEHOLDER_HEADER_IMG",
  };

  User.findOneAndUpdate(
    { _id: ObjectId(userID) },
    { $addToSet: { posts: { postID: newPost.postID, createdAt: newDate } } },
    (err, user) => {
      if (err) {
        res.json(err);
      }
      // else {res.json(user)}
    }
  );

  LifeGoal.findOneAndUpdate(
    { _id: ObjectId(lifeGoalID) },
    { $addToSet: { posts: newPost } },
    (err, lifeGoal) => {
      if (err) {
        res.json(err);
      } else if (lifeGoal === null) {
        res.json("lifeGoal does not exist");
      } else {
        res.json(lifeGoal);
      }
    }
  );
};

exports.deletePost = (req, res) => {
  const { userID, lifeGoalID, postID } = req.body;
  // Grab username from JWT
  let loggedInUser = "";
  // Grab lifegoal createdBy value

  jwt.verify(req.headers.authorization, "secret_key", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      loggedInUser = authData.user._id;
      // TODO --- if lifegoal deleted, leave history of it?
    }
  });

  //TODO - do similar verification as for delete lifegoal

  User.findOneAndUpdate(
    { _id: ObjectId(userID) },
    { $pull: { posts: { postID: ObjectId(postID) } } },
    { safe: true },
    (err, user) => {
      if (err) {
        res.json(err);
      }
      // else { res.json(user)}
    }
  );

  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID) },
    { $pull: { posts: { postID: ObjectId(postID) } } },
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
// TODO - deletepost jwt verify, commentonpost, search lifegoals/posts

exports.commentOnPost = (req, res) => {};

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
      commentIdRef: commentID,
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

// exports.postCommentReply = (req, res) => {
//   const { lifeGoalID, userID, commentID, comment, commentLevel } = req.body;
//   const newCommentID = new ObjectId().toString();
//   const newDate = new Date();
//   if (lifeGoalID && userID && comment) {
//     let userReply = {
//       userID: userID,
//       commentID: newCommentID,
//       comment: comment,
//       commentLevel: commentLevel,
//       createdAt: newDate,
//       replies: [],
//     };

//     LifeGoal.findOneAndUpdate(
//       { _id: new ObjectId(lifeGoalID), "comments.commentID": commentID },
//       { $addToSet: { "comments.$.replies": userReply } },
//       { new: true },
//       (err, lifeGoal) => {
//         if (err) {
//           res.json(err);
//         }

//         // else {
//         //   res.json(lifeGoal);
//         // }
//       }
//     );

//     let myReply = {
//       commentID: newCommentID,
//       createdAt: newDate,
//     };

//     User.findOneAndUpdate(
//       { _id: new ObjectId(userID), "myComments.commentID": commentID },
//       { $addToSet: { "myComments.$.replies": myReply } },
//       { new: true },
//       (err, user) => {
//         if (err) {
//           res.json(err);
//         } else {
//           res.json(user);
//         }
//       }
//     );
//   }
// };

exports.getLifeGoalComments = (req, res) => {
  const { lifeGoalID } = req.body;
  LifeGoal.findOne({ _id: new ObjectId(lifeGoalID) })
    .then((data) => {
      res.json(data.comments);
    })
    .catch((err) => res.status(400).json(err));
};

exports.getSingleComment = (req, res) => {
  const { commentID, lifeGoalID } = req.body;
  LifeGoal.findOne({
    _id: ObjectId(lifeGoalID),
  })
    .then((user) => {
      let comments = user.comments;
      let singleComment = comments.find(
        (comment) => comment.commentID === commentID
      );
      res.json(singleComment);
    })
    .catch((err) => res.json(err));
};

//Likes - on comments, not on lifeGoals? add  userid to array for easy counting and checking if already liked

exports.editComment = (req, res) => {
  const { commentID, updatedComment, lifeGoalID } = req.body;
  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID), "comments.commentID": commentID },
    {
      $set: {
        "comments.$.comment": updatedComment,
        "comments.$.createdAt": new Date(),
      },
    },
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

// TODO - deleteLifeGoal - delete ref to posts - need TRANSACTION FOR MULTIPLE UPDATES
// TODO - add req.currentUser verification to all functions and refactor

//TODO - FRONT END - socket.io to listen for changes to data, e.g. if logged in and another user updates goal or comments/messages you
