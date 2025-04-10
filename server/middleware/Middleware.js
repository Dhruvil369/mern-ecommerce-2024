const { authMiddleware } = require("../controllers/auth/auth-controller")

const verifyAdmin = (req, res, next) => {
    authMiddleware(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
        }
        next();
    });
};

module.exports = verifyAdmin;