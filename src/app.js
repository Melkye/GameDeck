const express = require("express");

const gameRoutes = require("../routes/Game.Route");
const userRoutes = require("../routes/User.Route");

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use("/games", gameRoutes);
app.use("/users", userRoutes);

module.exports = app;
