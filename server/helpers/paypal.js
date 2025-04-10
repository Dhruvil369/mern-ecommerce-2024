const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: "sandbox",
    client_id: "Ab-DqYZqJZnD7_kwIh2HwyZLhrk1w0qxSua4orUGy55PcJtvetpU2o9RTQWU9HtVd4wUFGxHYD_u0XlG",
    client_secret: "ECRWca979y-WVUL8qDDNj4YzcQBlg5JUchKsaXP4H8T-loEGt9esPEhjuA4SCsqB4tlOlaDy5_CietML",
});

module.exports = paypal;

// const Razorpay = require("razorpay");
// const crypto = require("crypto"); // ✅ Correct Node.js module

// const instance = new Razorpay({
//     key_id: "RAZORPAY_KEY_ID",
//     key_secret: "RAZORPAY_SECRET",
// });

// app.post("/api/create-razorpay-order", async(req, res) => {
//     const { amount } = req.body;

//     const options = {
//         amount: amount * 100, // Razorpay uses paise
//         currency: "INR",
//         receipt: "order_rcptid_11",
//     };

//     try {
//         const order = await instance.orders.create(options);
//         res.json({
//             success: true,
//             order: {
//                 orderId: order.id,
//                 amount: order.amount,
//                 currency: order.currency
//             }
//         }); // send { id, amount, currency }
//     } catch (err) {
//         res.status(500).json({ error: "Failed to create Razorpay order" });
//     }
// });

// app.post("/api/verify-payment", (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//         .createHmac("sha256", "YOUR_SECRET_KEY")
//         .update(body.toString())
//         .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//         res.send({ success: true });
//     } else {
//         res.status(400).send({ success: false });
//     }
// });