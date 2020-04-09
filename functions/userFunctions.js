const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const path = require("path");

// Init gfs
let gfs;
const connection = mongoose.connection;
connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Export Request Handlers

//GET
exports.getAllUsers = (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error:" + err));
};

//POST
exports.signup = (req, res) => {
  const {
    username,
    password,
    confirmPassword,
    email,
    profileImageUrl,
  } = req.body;
  const imgUrl = profileImageUrl ? profileImageUrl : "PLACEHOLDER_IMAGE_URL";
  const errorMessage = {};
  function createNewUser() {
    const newUser = new User({
      username,
      password,
      email,
      profileImageUrl: imgUrl,
    });
    bcrypt.hash(password, 10, function (err, hash) {
      newUser.password = hash;
      newUser
        .save()
        .then(() => res.json(`${username} signed up successfully!`))
        .catch((err) => {
          console.log(err);
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
      console.log("Logged In");
      // If authorised, create token
      jwt.sign({ user }, "secret_key", { expiresIn: "180m" }, (err, token) => {
        if (token) {
          // add res.header = token   ??
          res.json({ token });
          //TODO: put token in local storage
        } else {
          res.json("Error: " + err);
        }
      });
    }
  });
};

//POST
exports.createProfileImageUpload = (req, res) => {
  //Create storage engine
  const storage = new GridFsStorage({
    url: process.env.ATLAS_URI,
    file: (req, file) => {
      console.log(file.mimetype);
      if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
        throw "Error: File must be jpg or png";
      }
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename =
            buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads",
          };
          resolve(fileInfo);
        });
      });
    },
  });
  return multer({ storage });
};

//POST
exports.uploadProfileImage = (req, res) => {
  res.json({ file: req.file });
};

//GET
exports.getProfileImageFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    //Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({ err: "File does not exist" });
    }

    return res.json(file);
  });
};

//GET
exports.showImageFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    //Check if file
    console.log(file);
    if (!file || file.length === 0) {
      return res.status(404).json({ err: "File does not exist" });
    }
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } else {
      res.status(404).json({ err: "Not an image" });
    }
  });
};
//POST
exports.setProfileImage = (req, res) => {
  const { userID, profileImageUrl } = req.body;

  if (userID !== "userCredentials.id") {
    return res.status(403).json("Forbidden");
  }
  User.findOneAndUpdate(
    { _id: userID },
    { $set: { profileImageUrl: profileImageUrl } },
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
  const { location, bio, goalCategories, userID } = req.body;

  User.findOneAndUpdate(
    { _id: userID },
    { $set: { profile: { location, bio, goalCategories } } },
    { new: true },
    (err, user) => {
      if (err) {
        throw err;
      }
      res.json(user);
    }
  );
};

exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  User.findOne({ _id: req.body.userID })
    .then((user) => {
      console.log(user);
      userData.ownLifeGoals = user.ownLifeGoals;
      userData.messages = user.messages;
      userData.lifeGoalsFollowed = user.lifeGoalsFollowed;
      res.json(userData);
    })
    .catch((err) => res.json(err));
};
