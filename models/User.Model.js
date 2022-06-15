const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    games: [{ type: Schema.Types.ObjectId, ref: "Game" }],
});

const UserModel = mongoose.model("User", userSchema, "User");
module.exports = UserModel;
