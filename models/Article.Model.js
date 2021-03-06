const mongoose = require("mongoose");

const { Schema } = mongoose;

const articleSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        games: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Game",
            },
        ],
    },
    {
        timestamps: true,
    },
);

const ArticleModel = mongoose.model("Article", articleSchema);
module.exports = ArticleModel;
