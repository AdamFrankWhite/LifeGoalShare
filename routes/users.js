const router = require("express").Router();
let User = require("../models/user.model");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

router.route("/").get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json("Error:" + err));
});

router.route("/signup").post((req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({
    username,
    password,
    email
  });
  console.log(req.body);
  bcrypt.hash(password, 10, function(err, hash) {
    newUser.password = hash;
    // if ()
    newUser
      .save()
      .then(() => res.json(`${username} signed up successfully!`))
      .catch(err => res.status(400).json("Error is... " + err));
  });
});

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
      jwt.sign({ user }, "secret_key", (err, token) => {
        if (token) {
          res.json("Success: ");
        } else {
          res.json("Error: " + err);
        }
      });
    }
  });
});

module.exports = router;
