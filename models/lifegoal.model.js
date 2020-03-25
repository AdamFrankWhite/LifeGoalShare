const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lifeGoalSchema = new Schema(
  {
    lifeGoalName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6
    },
    lifeGoalDescription: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 6
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
      minLength: 6
    },
    followers: {
      type: Array,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const LifeGoal = mongoose.model("LifeGoal", lifeGoalSchema);

module.exports = LifeGoal;
