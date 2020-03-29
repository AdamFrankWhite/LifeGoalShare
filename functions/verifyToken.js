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
