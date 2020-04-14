const jwt = require("jsonwebtoken");

module.exports = function verifyUser(req) {
  jwt.verify(req.headers.authorization, "secret_key", (err, authData) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      return authData.user._id;
      // TODO --- if lifegoal deleted, leave history of it?
    }
  });
};
