const router = require("express").Router();
let User = require("../models/user.model");
let bcrypt = require("bcrypt");

router.route("/").get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json("Error:" + err));
});

router.route("/register").post((req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({
    username,
    password,
    email
  });
  console.log(req.body);
  bcrypt.hash(password, 10, function(err, hash) {
    newUser.password = hash;
    newUser
      .save()
      .then(() => res.json("User added!"))
      .catch(err => res.status(400).json("Error is... " + err));
  });
});

module.exports = router;
