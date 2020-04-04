const router = require("express").Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Get all users

router.route("/").get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json("Error:" + err));
});

// Signup

router.route("/signup").post((req, res) => {
  const { username, password, confirmPassword, email } = req.body;
  const errorMessage = {};

  function createNewUser() {
    const newUser = new User({
      username,
      password,
      confirmPassword,
      email
    });
    bcrypt.hash(password, 10, function(err, hash) {
      newUser.password = hash;
      newUser
        .save()
        .then(() => res.json(`${username} signed up successfully!`))
        .catch(err => res.status(400).json("Error is... " + err));
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
    }
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
});

// Login

router.route("/login").post((req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password
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
});

module.exports = router;
