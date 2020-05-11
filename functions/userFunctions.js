const User = require("../models/user.model");
const LifeGoal = require("../models/lifegoal.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const ObjectId = mongoose.Types.ObjectId;

// Init gfs
let gfs;
const connection = mongoose.connection;
connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Export Request Handlers

//GET
exports.getAuthenticatedUser = (req, res) => {
  User.findOne({ _id: req.currentUser })
    .then((user) => {
      console.log(user);
      let resData = {
        _id: user._id,
        profile: user.profile,
        username: user.username,
        createdAt: user.createdAt,
        messages: user.messages,
      };
      res.json(resData);
    })
    .catch((err) => res.json(err));
};

exports.getSpecificUsers = (req, res) => {
  // Expecting array of users
  const { users } = req.body;
  // Map to ObjectIds
  const usersToFind = users.map((user) => ObjectId(user));

  User.find({ _id: { $in: usersToFind } })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => res.json(err));
};

exports.getAllUsers = (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error:" + err));
};

// exports.getProfileImageFile = (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     //Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({ err: "File does not exist" });
//     }

//     return res.json(file);
//   });
// };

// exports.showImageFile = (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     //Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({ err: "File does not exist" });
//     }
//     if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
//       // Read output to browser
//       const readStream = gfs.createReadStream(file.filename);

//       res.writeHead(200, { "Content-Type": "image/png" });
//       readStream.pipe(res);
//     } else {
//       res.status(404).json({ err: "Not an image" });
//     }
//   });
// };

//POST
exports.signup = (req, res) => {
  const {
    username,
    password,
    confirmPassword,
    email,
    profileImageUrl,
    handle,
  } = req.body;
  const imgUrl = profileImageUrl ? profileImageUrl : "PLACEHOLDER_IMAGE_URL";
  const errorMessage = {};
  function createNewUser() {
    const newUser = new User({
      username,
      password,
      email,
      profile: {
        handle: handle ? handle : username,
        profileUrl: `PLACEHOLDER/${username}`,
        profileImageUrl: imgUrl,
        location: "",
        bio: "",
        lifeGoalCategories: [],
      },
      posts: [],
    });
    bcrypt.hash(password, 10, function (err, hash) {
      newUser.password = hash;
      newUser
        .save()
        .then(() => res.json(`${username} signed up successfully!`))
        .catch((err) => {
          let errorMessage;
          res.status(400);
          if (err.errmsg.includes("username_1 dup key")) {
            errorMessage = "Username already taken";
          }
          if (err.errmsg.includes("email_1 dup key")) {
            errorMessage = "Email already in use";
          }
          errorMessage
            ? res.json({ errorMessage })
            : res.json("Error is... " + err);
        });
    });
  }

  // Server-side validation
  if (!username) {
    errorMessage.usernameError = "Please enter a username";
  }
  if (!password) {
    errorMessage.passwordError = "Please enter a password";
  }
  if (!email) {
    errorMessage.emailError = "Please enter a valid email address";
  }
  if (password !== confirmPassword) {
    errorMessage.confirmPasswordError = "Passwords must match";
  }
  if (username && password && confirmPassword && email) {
    if (
      username.length >= 6 &&
      email.includes("@") &&
      password === confirmPassword
    ) {
      createNewUser();
    } else {
      if (username.length < 6) {
        errorMessage.usernameError = "Username must be at least 6 characters";
      }
      if (!email.includes("@") || email.length < 5) {
        errorMessage.emailError = "Please enter a valid email address";
      }

      if (password !== confirmPassword) {
        errorMessage.confirmPasswordError = "Passwords must match";
      }
      res.status = 401;
      res.json(errorMessage);
    }
  }
};

//POST
exports.login = (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };
  //Authentication
  User.authenticate(user.username, user.password, (error, user) => {
    if (error || !user) {
      let err = new Error();
      err.status = 401;
      err.message = "User or password do not match";
      return res.json(err);
    } else {
      console.log("Login attempt...");
      // If authorised, create token
      jwt.sign(
        { user },
        "secret_key",
        // { expiresIn: "5m" },
        (err, token) => {
          if (token) {
            console.log("Success");
            res.status(200).json({ token });
          } else {
            console.log("Login failed");
            res.status(401).json("Error: " + err);
          }
        }
      );
    }
  });
};

//POST
// exports.createProfileImageUpload = (req, res) => {
//   //Create storage engine
//   const storage = new GridFsStorage({
//     url: process.env.ATLAS_URI,
//     file: (req, file) => {
//       if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
//         throw "Error: File must be jpg or png";
//       }
//       return new Promise((resolve, reject) => {
//         crypto.randomBytes(16, (err, buf) => {
//           if (err) {
//             return reject(err);
//           }
//           const filename =
//             buf.toString("hex") + path.extname(file.originalname);
//           const fileInfo = {
//             filename: filename,
//             bucketName: "uploads",
//           };
//           resolve(fileInfo);
//         });
//       });
//     },
//   });
//   return multer({ storage });
// };

//POST

exports.fileUpload = (req, res) => {
  if (req.files === null) {
    return res.status(400).json("No file uploaded");
  }
  // NEED TO VALIDATE IMAGE
  const file = req.files.file;
  const fileDestinationUrl = `../../lifegoalshare-client/public/uploads/profilePics/${req.currentUser}`;
  const clientFileUrl = `/uploads/profilePics/${req.currentUser}/${file.name}`;
  let clientPath = path.join(__dirname, fileDestinationUrl);
  // Checks if user image folder exists, if not creates one
  if (!fs.existsSync(clientPath)) {
    fs.mkdirSync(clientPath);
  }
  //Empties folder to ensure only one image per user
  fsExtra.emptyDirSync(clientPath);
  //Move new image to folder
  file.mv(`${clientPath}/${file.name}`, (err) => {
    if (err) {
      res.json(err);
    }
  });
  User.findOneAndUpdate(
    { _id: ObjectId(req.currentUser) },
    { $set: { "profile.profileImageUrl": clientFileUrl } },
    { new: true },
    (err, user) => {
      if (err) {
        throw err;
      }
      res.json({ user, clientFileUrl });
    }
  );
};

// exports.uploadProfileImage = (req, res) => {
//   res.json({ file: req.file });
// };

//POST
exports.setProfileImage = (req, res) => {
  const { profileImageUrl } = req.body;

  User.findOneAndUpdate(
    { _id: ObjectId(req.currentUser) },
    { $set: { "profile.profileImageUrl": profileImageUrl } },
    { new: true },
    (err, user) => {
      if (err) {
        throw err;
      }
      res.json(user);
    }
  );
};

exports.updateUserDetails = (req, res) => {
  const { location, bio, lifeGoalCategories } = req.body;

  User.findOneAndUpdate(
    { _id: req.currentUser },
    { $set: { "profile.location": location, "profile.bio": bio } },
    { new: true },
    (err, user) => {
      if (err) {
        throw err;
      }
      res.json(user);
    }
  );
};

exports.sendMessage = (req, res) => {
  const { senderID, receiverID, message, parents } = req.body;
  const messageToBeSent = {
    messageID: new ObjectId(),
    senderID,
    receiverID,
    message,
    parents: !parents ? [] : parents,
    createdAt: new Date(),
  };

  // Sent Message
  User.findOneAndUpdate(
    { _id: ObjectId(senderID) },
    { $addToSet: { "messages.sent": messageToBeSent } },
    (err, user) => {
      if (err) {
        res.json(err);
      } else {
        res.json(user);
      }
    }
  );

  //Received Message
  User.findOneAndUpdate(
    { _id: ObjectId(receiverID) },
    { $addToSet: { "messages.received": messageToBeSent } },
    (err, user) => {
      if (err) {
        res.json(err);
      } else {
        res.json(user);
      }
    }
  );
};

exports.deleteMessage = (req, res) => {
  const { userID, messageID, messageType } = req.body;
  // Only deletes message for user taking action
  User.findOneAndUpdate(
    { _id: userID },
    {
      $pull: {
        [`messages.${messageType}`]: { messageID: ObjectId(messageID) },
      },
    },
    { safe: true },
    (err, user) => {
      if (err) {
        res.json(err);
      } else {
        res.json("Message deleted");
      }
    }
  );
};

exports.getUserComments = (req, res) => {
  LifeGoal.find({ comments: { $elemMatch: { author: req.currentUser } } })
    .then((posts) => {
      let myComments = [];
      posts.forEach((post) => {
        post.comments.forEach((comment) =>
          myComments.push({ post: post._id, comment: comment })
        );
      });
      res.json(myComments);
    })
    .catch((err) => res.json(err));
  //   LifeGoal.aggregate([
  //     { $match: { comments: { $elemMatch: { author: req.currentUser } } } },
  //   ])
  //     .then((comments) => {
  //       res.json(comments);
  //     })
  //     .catch((err) => res.json(err));
};
// see if you can return only certain fields, i.e. id, comments

// NEXT - add comment to post

// TODO - you don't need most/all of the multi-part callbacks, you can trim excess user data, just query it from lifegoals - DONE
// TODO - messages need own collection
// TODO - query comments / posts
