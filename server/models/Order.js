const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    // userId: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

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