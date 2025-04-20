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
        origin: "http://localhost:5173", // update with frontend domain in production
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

    // New prescription socket events
    socket.on("new_prescription", (data) => {
        if (!data) {
            console.log("❌ Prescription data is null or undefined");
        } else {
            console.log("📦 New prescription received via socket:", data);
            io.emit("admin_new_prescription", data); // Broadcast to all connected clients
        }
    });

    socket.on("prescription_accepted", (prescriptionId) => {
        console.log(`Prescription ${prescriptionId} accepted`);
        io.emit("prescription_accepted", prescriptionId); // Broadcast that the prescription has been accepted
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
        origin: "http://localhost:5173",
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
    status: { type: String, default: "pending" }, // pending, assigned, completed
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: String,
    addressInfo: {
        addressId: String,
        address: String,
        city: String,
        pincode: String,
        phone: String,
        notes: String,
    },
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

    // Extract user information and address from request body
    const { userId, userName, addressId, address, city, pincode, phone, notes } = req.body;

    // Check if address information is provided
    if (!addressId || !address || !city || !pincode || !phone) {
        return res.status(400).json({
            success: false,
            message: "Address information is required"
        });
    }

    const newPrescription = new Prescription({
        imageUrl: `/uploads/${req.file.filename}`,
        userId: userId || null,
        userName: userName || "Anonymous User",
        addressInfo: {
            addressId,
            address,
            city,
            pincode,
            phone,
            notes: notes || "",
        },
    });

    await newPrescription.save();

    // Emit socket event for real-time notification
    io.emit("admin_new_prescription", newPrescription);

    res.json({
        success: true,
        message: "Prescription uploaded successfully!",
        data: newPrescription,
    });
});

// Get all prescriptions
app.get("/api/admin/prescriptions", async(req, res) => {
    try {
        const prescriptions = await Prescription.find().sort({ uploadedAt: -1 });
        res.json({
            success: true,
            data: prescriptions
        });
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching prescriptions"
        });
    }
});

// Get unassigned prescriptions
app.get("/api/admin/prescriptions/unassigned", async(req, res) => {
    try {
        const prescriptions = await Prescription.find({ assignedTo: null }).sort({ uploadedAt: -1 });
        res.json({
            success: true,
            data: prescriptions
        });
    } catch (error) {
        console.error("Error fetching unassigned prescriptions:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching unassigned prescriptions"
        });
    }
});

// Get prescriptions assigned to a specific admin
app.get("/api/admin/prescriptions/assigned/:adminId", async(req, res) => {
    try {
        const { adminId } = req.params;
        const prescriptions = await Prescription.find({ assignedTo: adminId }).sort({ uploadedAt: -1 });
        res.json({
            success: true,
            data: prescriptions
        });
    } catch (error) {
        console.error("Error fetching assigned prescriptions:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching assigned prescriptions"
        });
    }
});

// Accept a prescription
app.put("/api/admin/prescriptions/accept/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;

        const prescription = await Prescription.findById(id);
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });
        }

        if (prescription.assignedTo) {
            return res.status(400).json({
                success: false,
                message: "Prescription already assigned"
            });
        }

        prescription.assignedTo = adminId;
        prescription.status = "assigned";
        await prescription.save();

        // Emit socket event
        io.emit("prescription_accepted", prescription);

        res.json({
            success: true,
            data: prescription
        });
    } catch (error) {
        console.error("Error accepting prescription:", error);
        res.status(500).json({
            success: false,
            message: "Error accepting prescription"
        });
    }
});

// Mark prescription as completed
app.put("/api/admin/prescriptions/complete/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;

        const prescription = await Prescription.findById(id);
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });
        }

        if (prescription.assignedTo.toString() !== adminId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this prescription"
            });
        }

        prescription.status = "completed";
        await prescription.save();

        res.json({
            success: true,
            data: prescription
        });
    } catch (error) {
        console.error("Error completing prescription:", error);
        res.status(500).json({
            success: false,
            message: "Error completing prescription"
        });
    }
});

// ✅ Start HTTP + WebSocket Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));