const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6
    },
    password: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6
    },
    confirmPassword: {
      type: String,
      required: true,
      trim: true,
      minLength: 6
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6
    },
    imgUrl: {
      type: String,
      trim: true,
      minLength: 6
    },
    profile: {
      type: String,
      unique: true,
      trim: true,
      minLength: 6
    },
    location: {
      type: String,
      trim: true,
      minLength: 6
    }
  },
  {
    timestamps: true
  },
  { runValidators: true }
);

userSchema.statics.authenticate = (username, password, callback) => {
  User.findOne({ username: username }).exec((error, user) => {
    if (error) {
      return callback(error);
    } else if (!user) {
      let error = new Error("User not found");
      error.status = 401;
      return callback(error);
    }
    bcrypt.compare(password, user.password, (error, result) => {
      if (result === true) {
        return callback(null, user);
      } else {
        return callback(error);
      }
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
