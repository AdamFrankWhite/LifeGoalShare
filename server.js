const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
const dbURI = process.env.ATLAS_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connect to Mongo");
});
const usersRouter = require("./routes/users.js");
const lifegoalsRouter = require("./routes/lifegoals.js");

app.use("/", usersRouter);
app.use("/lifegoals", lifegoalsRouter);

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
