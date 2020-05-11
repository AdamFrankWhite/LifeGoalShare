const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    receiver: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    parents: {
      type: Array,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
