const mongoose = require("mongoose");

const { Schema } = mongoose;

const gameSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        articles: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Article",
            },
        ],
        users: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
        ],
        reviews: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Review",
            },
        ],
    },
    {
        timestamps: true,
    },
);

const GameModel = mongoose.model("Game", gameSchema);
module.exports = GameModel;
