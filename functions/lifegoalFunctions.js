const LifeGoal = require("../models/lifegoal.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Note: Access userData via req.currentUserData (see verifyToken)

exports.getLifeGoals = (req, res) => {
  LifeGoal.find()
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json("Error: " + error));
};

exports.getUserLifeGoals = (req, res) => {
  const handle = req.params.id;
  LifeGoal.find({ "createdBy.handle": handle })
    .then((lifegoals) => {
      return res.json(lifegoals);
    })
    .catch((err) => {
      return res.json(err);
    });
};

//Get Followers

exports.getFollowers = (req, res) => {
  // deconstruct lifeGoalIDs array
  const { lifeGoalIDs } = req.body;
  const lifeGoalIdObjects = lifeGoalIDs.map(
    (lifeGoal) => new ObjectId(lifeGoal)
  );
  // Find lifegoal followers
  LifeGoal.find({ _id: { $in: lifeGoalIdObjects } }).then((lifegoals) => {
    let followersList = [];
    lifegoals.forEach((lifeGoal) => {
      //Extract followers array from lifeGoal object
      let { followers } = lifeGoal;
      followers.forEach((follower) => {
        if (!followersList.includes(follower.followerID)) {
          followersList.push(follower.followerID);
        }
      });
      // if followers doesn't include, push followerID
    });

    const followerIDs = followersList.map((follower) => new ObjectId(follower));
    //Find follower profile images
    User.find({ _id: { $in: followerIDs } })
      .then((data) => {
        let followerImagePaths = {};
        data.map((follower) => {
          followerImagePaths[follower._id] = follower.profile.profileImageUrl;
        });
        return res.json(followerImagePaths);
      })
      .catch((err) => res.json(err));
  });
};

exports.addLifeGoal = (req, res) => {
  const {
    lifeGoalName,
    lifeGoalDescription,
    initialPostName,
    initialPostContent,
    initialPostHeaderImage,
  } = req.body;

  const initialPost = {
    postID: new ObjectId(),
    postName: initialPostName,
    postContent: initialPostContent,
    createdBy: req.currentUserID,
    createdAt: new Date(),
    comments: [],
    postHeaderImage: initialPostHeaderImage
      ? initialPostHeaderImage
      : "PLACEHOLDER_HEADER_IMG",
  };

  const lifeGoal = new LifeGoal({
    lifeGoalName,
    lifeGoalDescription,
    createdBy: req.currentUserData.profile,
    followers: [],
    posts: [initialPost],
  });
  lifeGoal
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).json("Error:" + err));
};

exports.deleteLifeGoal = (req, res) => {
  // Grab username from JWT
  let loggedInUser = req.currentUserID;

  const { lifeGoalID } = req.body;
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
  const { lifeGoalID, postData } = req.body;
  const newDate = new Date();
  const newPost = {
    postID: new ObjectId(),
    postName: postData.postName,
    postContent: postData.postContent,
    createdBy: req.currentUserID,
    createdAt: newDate,
    comments: [],
    postHeaderImage: postData.postHeaderImage ? postData.postHeaderImage : "",
  };

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
  const { lifeGoalID, postID } = req.body;
  // Grab username from JWT
  let loggedInUser = req.currentUserID;

  // Grab lifegoal createdBy value

  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID) },
    { $pull: { posts: { postID: ObjectId(postID) } } },
    { safe: true },
    (err, lifeGoal) => {
      if (err) {
        res.json(err);
      } else {
        res.json(`Post "${postID}" deleted`);
      }
    }
  );
};

exports.commentOnPost = (req, res) => {
  const { postID, comment, parentComments } = req.body;
  const commentID = new ObjectId().toString();
  const newDate = new Date();

  let userComment = {
    commentID: commentID,
    author: req.currentUserData.profile.handle,
    comment: comment,
    parents: !parentComments ? [] : parentComments,
    createdAt: newDate,
  };

  LifeGoal.findOneAndUpdate(
    { "posts.postID": new ObjectId(postID) },
    { $addToSet: { "posts.$.comments": userComment } },
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

exports.followLifeGoal = (req, res) => {
  const { lifeGoalID } = req.body;

  // Add follower to lifeGoal
  let followerData = {
    followerID: req.currentUserID,
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
        res.json(`LifeGoal followed`);
      }
    }
  );
};

exports.unfollowLifeGoal = (req, res) => {
  //Update UserData
  const { lifeGoalID } = req.body;

  // Update lifegoal
  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID) }, // To be clear ======> When querying main collection with id, it needs to be an object. However, if you created ids, then string is to be expected
    { $pull: { followers: { followerID: req.currentUserID } } },
    { safe: true },
    (err, lifeGoal) => {
      if (err) {
        res.json(err);
      } else {
        res.json("lifeGoal unfollowed");
      }
    }
  );
};

//Add comment

exports.postNewComment = (req, res) => {
  const { lifeGoalID, comment, parentComments } = req.body;
  const commentID = new ObjectId().toString();
  const newDate = new Date();

  let userComment = {
    commentID: commentID,
    author: req.currentUserData.profile.handle,
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
      } else {
        res.json("Comment added!");
      }
    }
  );
};

exports.deleteComment = (req, res) => {
  //Update UserData

  const { commentID, lifeGoalID } = req.body;
  LifeGoal.findOneAndUpdate(
    { _id: new ObjectId(lifeGoalID), "comments.commentID": commentID },
    {
      $set: {
        "comments.$.comment": "DELETED",
        "comments.$.createdAt": new Date(),
      },
    },
    { new: true },
    (err, lifeGoal) => {
      if (err) {
        res.json(err);
      } else {
        res.json("Comment updated");
      }
    }
  );

  // // Update lifegoal
  // LifeGoal.findOneAndUpdate(
  //   { _id: new ObjectId(lifeGoalID) }, // To be clear ======> When querying main collection with id, it expects to be an object, as that is what your Schema is set to create. However, if you created ids, then string is to be expected. Pay attention to the method of id creation!
  //   { $pull: { comments: { commentID: commentID } } },
  //   { safe: true },
  //   (err, lifeGoal) => {
  //     if (err) {
  //       res.json(err);
  //     } else {
  //       res.json("Comment deleted!");
  //     }
  //   }
  // );
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
        res.json("Comment updated");
      }
    }
  );
};

// TODO - deleteLifeGoal - delete ref to posts - need TRANSACTION FOR MULTIPLE UPDATES
// TODO - add req.currentUser verification to all functions and refactor

//TODO - FRONT END - socket.io to listen for changes to data, e.g. if logged in and another user updates goal or comments/messages you
