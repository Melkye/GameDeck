const express = require("express");

const gameRouter = require("../routers/Game.Router");
const userRouter = require("../routers/User.Router");

const app = express();

app.use(express.json());

app.use("/games", gameRouter);
app.use("/users", userRouter);

module.exports = app;
