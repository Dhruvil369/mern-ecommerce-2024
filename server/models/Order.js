const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    // Store both user reference and userId for backward compatibility
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    userId: String, // Keep this for backward compatibility with Flutter app

    cartId: String,
    cartItems: [{
        productId: String,
        title: String,
        image: String,
        price: String,
        quantity: Number,
    }, ],
    addressInfo: {
        addressId: String,
        address: String,
        city: String,
        pincode: String,
        phone: String,
        notes: String,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = unassigned
    orderStatus: String,
    paymentMethod: String,
    paymentStatus: String,
    totalAmount: Number,
    orderDate: Date,
    orderUpdateDate: Date,
    paymentId: String,
    payerId: String,
});

module.exports = mongoose.model("Order", OrderSchema);