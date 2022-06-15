const mongoose = require("mongoose");

const { Schema } = mongoose;

const gameSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    articles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const GameModel = mongoose.model("Game", gameSchema, "Game");
module.exports = GameModel;
