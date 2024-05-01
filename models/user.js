const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "default.jpg",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", userSchema);