const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        games: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Game",
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

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
