// Imports

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
const verifyToken = require("./functions/verifyToken");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

// Config

const port = process.env.PORT || 5000;
require("dotenv").config();

// DB Config
const dbURI = process.env.ATLAS_URI;
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

// Init gfs
let gfs;
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected to Mongo");
  //Init Stream
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

//Create storage engine
const storage = new GridFsStorage({
  url: dbURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
// Initialise App
const app = express();

// Middleware
app.use(express.json());
app.use(bodyparser.json());
app.use(methodOverride("_method"));

// Routers
const usersRouter = require("./routes/users.js");
const lifegoalsRouter = require("./routes/lifegoals.js");

// Routes
app.post("/users/profile", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
});
//TODO - move above into userrouter
app.use("/users", usersRouter);
app.use("/lifegoals", verifyToken, lifegoalsRouter);

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
