const express = require("express");
const mongoose = require("mongoose");

const logger = require("../logs/logger");

const gameRouter = require("../routers/Game.Router");
const userRouter = require("../routers/User.Router");
const articleRouter = require("../routers/Article.Router");

const app = express();

const url = "mongodb://0.0.0.0:27017/Gamedeck";

mongoose
    .connect(url)
    .then(() => { logger.info("Connected correctly to server");})
    .catch((error) => { logger.error(error); });

app.use(express.json());

app.use("/games", gameRouter);
app.use("/users", userRouter);
app.use("/articles", articleRouter);

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    logger.error({message: error.message, stack: error.stack});
    res.send(error.message);
});

module.exports = app;
