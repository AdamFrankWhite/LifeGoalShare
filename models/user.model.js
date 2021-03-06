const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6,
    },
    password: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6,
    },
    profile: {
      type: Object,
      unique: true,
      trim: true,
      minLength: 6,
    },
    messages: {
      type: Object,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
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
