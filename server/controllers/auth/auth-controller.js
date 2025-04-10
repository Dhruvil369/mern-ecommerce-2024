const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// Register
const registerUser = async(req, res) => {
    const { userName, email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (checkUser)
            return res.json({
                success: false,
                message: "User already exists with the same email! Please try again",
            });

        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: "Registration successful",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Some error occurred",
        });
    }
};

// Login
const loginUser = async(req, res) => {
    const { email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser)
            return res.json({
                success: false,
                message: "User doesn't exist! Please register first",
            });

        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
        if (!checkPasswordMatch)
            return res.json({
                success: false,
                message: "Incorrect password! Please try again",
            });

        const token = jwt.sign({
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
            },
            "CLIENT_SECRET_KEY", // change to process.env.JWT_SECRET in production
            { expiresIn: "60m" }
        );

        // Store token in DB
        checkUser.token = token;
        await checkUser.save();

        res.cookie("token", token, { httpOnly: true, secure: false }).json({
            success: true,
            message: "Logged in successfully",
            token,
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id,
                userName: checkUser.userName,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Some error occurred",
        });
    }
};

// Logout
const logoutUser = async(req, res) => {
    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
        await User.findByIdAndUpdate(decoded.id, { token: null }); // remove token from DB
    } catch (err) {
        console.log("Token already expired or invalid");
    }

    res.clearCookie("token").json({
        success: true,
        message: "Logged out successfully!",
    });
};

// Auth Middleware
const authMiddleware = async(req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({
            success: false,
            message: "Unauthorized user!",
        });

    try {
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
        const user = await User.findById(decoded.id);

        if (!user || user.token !== token) {
            return res.status(401).json({ success: false, message: "Invalid session!" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized user!",
        });
    }
};

// Admin Middleware
const adminMiddleware = async(req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({
            success: false,
            message: "Token not found in middleware!",
        });

    try {
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
        const admin = await User.findById(decoded.id);

        if (!admin || admin.token !== token || admin.role !== "admin") {
            return res.status(401).json({ success: false, message: "Unauthorized admin!" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized admin!",
        });
    }
};
// In your controller file
const getMe = async(req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "No token found" });
    }

    try {
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
        const user = await User.findById(decoded.id);

        if (!user || user.token !== token) {
            return res.status(401).json({ success: false, message: "Invalid session" });
        }

        return res.status(200).json({
            success: true,
            user: {
                email: user.email,
                role: user.role,
                userName: user.userName,
                id: user._id,
            },
        });
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    authMiddleware,
    adminMiddleware,
    getMe
};