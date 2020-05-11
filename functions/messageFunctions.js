const Message = require("../models/message.model");

exports.getMessages = (req, res) => {
  let user = req.currentUserHandle;
  console.log(user);
  Message.find({ $or: [{ sender: user }, { receiver: user }] })
    .then((messages) => {
      res.json(messages);
    })
    .catch((err) => res.json(err));
};

exports.sendMessage = (req, res) => {
  const { sender, receiver, message, parents } = req.body;
  const messageToBeSent = {
    sender,
    receiver,
    message,
    parents: !parents ? [] : parents,
  };

  // Create message
  const newMessage = new Message(messageToBeSent);
  newMessage
    .save()
    .then(() => res.json("Message Sent"))
    .catch((err) => res.json(err));
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
