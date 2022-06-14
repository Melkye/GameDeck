const mongoose = require("mongoose");

const { Schema } = mongoose;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    games: [{ type: Schema.Types.ObjectId, ref: "Game" }],
});

const ArticleModel = mongoose.model("Article", articleSchema);
module.exports = ArticleModel;
