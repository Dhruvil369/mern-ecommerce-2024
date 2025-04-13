const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

// ✅ Initialize app BEFORE using it with http
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // update with frontend domain in production
        methods: ["GET", "POST"],
    },
});

// ✅ Socket.io setup
io.on("connection", (socket) => {
    console.log("✅ New socket connected:", socket.id);

    socket.on("neworder", (data) => {
        if (!data) {
            console.log("❌ Order data is null or undefined");
        } else {
            console.log("📦 New order received via socket:", data);
            io.emit("admin_new_order", data); // Broadcast to all connected clients
        }
    });

    socket.on("order_accepted", (orderId) => {
        console.log(`Order ${orderId} accepted`);
        io.emit("order_accepted", orderId); // Broadcast that the order has been accepted
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
    });
});

// ✅ MongoDB Connection
mongoose
    .connect("mongodb+srv://tradewithengineer369:dhruvil123@e-commerce.qmcklsk.mongodb.net/")
    .then(() => console.log("✅ MongoDB connected"))
    .catch((error) => console.log("❌ MongoDB error:", error));

// ✅ Middleware Setup
app.use(
    cors({
        origin: "https://f8da-2401-4900-7c1c-9309-e5e3-112f-3475-24ad.ngrok-free.app",
        methods: ["GET", "POST", "DELETE", "PUT"],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/uploads", express.static("uploads"));

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);

// ✅ Prescription Schema & Upload
const prescriptionSchema = new mongoose.Schema({
    imageUrl: String,
    uploadedAt: { type: Date, default: Date.now },
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

app.post("/upload", upload.single("prescription"), async(req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const newPrescription = new Prescription({
        imageUrl: `/uploads/${req.file.filename}`,
    });

    await newPrescription.save();

    res.json({
        message: "Prescription uploaded successfully!",
        data: newPrescription,
    });
});

app.get("/prescriptions", async(req, res) => {
    const prescriptions = await Prescription.find();
    res.json(prescriptions);
});

// ✅ Start HTTP + WebSocket Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
