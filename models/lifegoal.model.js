const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lifeGoalSchema = new Schema(
  {
    lifeGoalName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6,
    },
    lifeGoalDescription: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6,
    },
    createdBy: {
      type: Object,
      required: true,
      trim: true,
    },
    followers: {
      type: Array,
      required: true,
    },
    posts: {
      type: Array,
      required: true,
    },
    comments: {
      type: Array,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const LifeGoal = mongoose.model("LifeGoal", lifeGoalSchema);

module.exports = LifeGoal;
