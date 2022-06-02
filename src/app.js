const express = require("express");
const gameRoutes = require("../routes/Game.Route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/games", gameRoutes);

module.exports = app;
