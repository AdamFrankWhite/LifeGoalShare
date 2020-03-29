// Verify Token

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  //FORMAT OF TOKEN:
  // Authorization: Bearer <access_token>

  //Check if bearer undefined
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    res.token = bearerToken;
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

module.exports = verifyToken;
