// Verify Token
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  //FORMAT OF TOKEN:
  // Authorization: Bearer <access_token>

  //Check if bearer undefined
  if (typeof bearerHeader !== "undefined") {
    jwt.verify(bearerHeader, "secret_key", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        // Place logged in user id in req object, to be passed along to callback function
        req.currentUser = authData.user._id.toString();
        // console.log({ message: "you have done something lifegoal", authData });
        next();
      }
    });
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

module.exports = verifyToken;
