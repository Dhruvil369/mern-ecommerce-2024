const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Admin = require("../../models/User")
    //register
const registerUser = async(req, res) => {
    const { userName, email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (checkUser)
            return res.json({
                success: false,
                message: "User Already exists with the same email! Please try again",
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
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
};

//login
const loginUser = async(req, res) => {
    const { email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser)
            return res.json({
                success: false,
                message: "User doesn't exists! Please register first",
            });

        const checkPasswordMatch = await bcrypt.compare(
            password,
            checkUser.password
        );
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
            "CLIENT_SECRET_KEY", { expiresIn: "60m" }
        );
        console.log("Tocken", token);
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
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
};

//logout
const logoutUser = (req, res) => {
    res.clearCookie("token").json({
        success: true,
        message: "Logged out successfully!",
    });
};

//auth middleware
const authMiddleware = async(req, res, next) => {
    const token = req.cookies.token;
    console.log("This is token in auth middleware", token);
    if (!token)
        return res.status(401).json({
            success: false,
            message: "Unauthorised user!",
        });

    try {
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
        console.log(decoded);
        req.user = decoded;
        console.log("Auth middleware running properly");
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorised user!",
        });
    }
};

const adminMiddleware = async(req, res, next) => {
    const token = req.cookies.token;
    console.log("This is token in auth middleware of admin ", token);
    if (!token)
        return res.status(401).json({
            success: false,
            message: "Token not found in middleware!",
        });
    console.log("Admin Middleware Running till try");
    try {
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
        console.log(decoded);
        req.user = decoded;
        console.log("Auth middleware running properly");
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorised user!",
        });
    }
};

// const adminMiddleware = async(req, res, next) => {
//     const authHeader = req.cookies.token;
//     console.log("Authorization Header:", authHeader);

//     if (!authHeader) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized user!",
//         });
//     }

//     const token = authHeader.split(" ")[1];
//     console.log("This is token", token);
//     try {
//         console.log("Start");
//         const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
//         console.log("This is decode", decoded);
//         req.user = decoded;
//         console.log("Done");
//         next();
//     } catch (error) {
//         console.log(error.message);
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized user!",
//         });
//     }
// };

// const adminMiddleware = async(req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "No token provided" });
//         }

//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET); // Your JWT secret here

//         const admin = await Admin.findById(decoded.id).select("-password");

//         if (!admin) {
//             return res.status(401).json({ message: "Admin not found" });
//         }
//         console.log("Admin Middleware", admin);
//         req.user = admin; // 💥 THIS is critical
//         next();
//     } catch (error) {
//         console.error(error);
//         res.status(401).json({ message: "Invalid token" });
//     }
// }

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, adminMiddleware };
