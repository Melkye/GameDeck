const express = require("express");
const mongoose = require("mongoose");

const gameRouter = require("../routers/Game.Router");
const userRouter = require("../routers/User.Router");
const articleRouter = require("../routers/Article.Router");

const app = express();

const url = "mongodb://0.0.0.0:27017/Gamedeck";

mongoose
    .connect(url)
    .then(() => { console.log("Connected correctly to server");})
    .catch((err) => { console.log(err); });

app.use(express.json());

app.use("/games", gameRouter);
app.use("/users", userRouter);
app.use("/articles", articleRouter);

module.exports = app;
