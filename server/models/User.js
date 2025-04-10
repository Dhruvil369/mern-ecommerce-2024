const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
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
    role: {
        type: String,
        default: "user",
    },
<<<<<<< HEAD
    token: {
        type: String, // 👈 Add this field
        default: null,
    },
=======
    
>>>>>>> 2e822e724d5ab55122a7e678dce1e5a133d4387b
});

const User = mongoose.model("User", UserSchema);
module.exports = User;