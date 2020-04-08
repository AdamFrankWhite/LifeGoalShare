// Imports

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
const verifyToken = require("./functions/verifyToken");

// Config

const port = process.env.PORT || 5000;
require("dotenv").config();

// DB Config
const dbURI = process.env.ATLAS_URI;
mongoose.connect(dbURI, {
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected to Mongo");
});

// Initialise App
const app = express();

// Middleware
app.use(express.json());

// Routers
const usersRouter = require("./routes/users.js");
const lifegoalsRouter = require("./routes/lifegoals.js");

// Routes

app.use("/users", usersRouter);
app.use("/lifegoals", verifyToken, lifegoalsRouter);

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
