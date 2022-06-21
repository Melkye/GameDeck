const mongoose = require("mongoose");

const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        isGameRecommended: {
            type: Boolean,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        game: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Game",
        },
    },
    {
        timestamps: true,
    },
);

const ReviewModel = mongoose.model("Review", reviewSchema);
module.exports = ReviewModel;
