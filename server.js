// Imports

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
const fileUpload = require("express-fileupload");
const http = require("http");
const socketio = require("socket.io");

// Config

const port = process.env.PORT || 5000;
require("dotenv").config();

// DB Config
const dbURI = process.env.ATLAS_URI;
mongoose.connect(dbURI, {
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected to Mongo");
});

// Initialise App
const app = express();

//Initialise server manually

const server = http.createServer(app);

// Socketio config

const io = socketio(server);

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Routers
const usersRouter = require("./routes/users.js");
const lifegoalsRouter = require("./routes/lifegoals.js");
const messagesRouter = require("./routes/messages.js");

//TODO - session/passport for db user restrictions to database

// Routes

app.use("/users", usersRouter);
app.use("/lifegoals", lifegoalsRouter);
app.use("/messages", messagesRouter);

//TODO - pass verifyToken to users, clean up userFunctions

server.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});

// Listen for client socket connection

io.on("connection", (socket) => {
  console.log("New socket connection");

  socket.once("disconnect", () => {
    console.log("User disconnected");
  });
});
