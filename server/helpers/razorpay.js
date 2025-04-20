const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay with your key_id and key_secret
const instance = new Razorpay({
    key_id: "rzp_test_OwZXl4RivBMDZR", // Replace with your actual key_id
    key_secret: "5cNhRuCaz082UCdHt7yGYN4h", // Replace with your actual secret key
});

// Function to create a Razorpay order
const createRazorpayOrder = async(amount, receipt) => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Razorpay uses amount in paise (multiply by 100)
            currency: "INR",
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        return {
            success: true,
            order: order
        };
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        return {
            success: false,
            error: error.message || "Failed to create Razorpay order"
        };
    }
};

// Function to verify Razorpay payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", instance.key_secret)
            .update(body.toString())
            .digest("hex");

        return { success: expectedSignature === signature };
    } catch (error) {
        console.error("Razorpay signature verification error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    instance,
    createRazorpayOrder,
    verifyPaymentSignature,
    KEY_ID: instance.key_id
};