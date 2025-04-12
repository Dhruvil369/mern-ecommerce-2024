const express = require("express");
const { registerUser, loginUser, logoutUser, authMiddleware, } = require("../../controllers/auth/auth-controller");
const User = require("../../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, async(req, res) => {
    const token = req.cookies.token;
    console.log("Token for  Database AuthCheck", token);
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    console.log("Going in try block");
    try {
        console.log(token);
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY"); // use env in prod
        console.log('Debug:', decoded);
        const user = await User.findById(decoded.id);
        console.log("check user", user);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            user: {
                email: user.email,
                role: user.role,
                id: user._id,
                userName: user.userName,
            },
        });
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
});
module.exports = router;
