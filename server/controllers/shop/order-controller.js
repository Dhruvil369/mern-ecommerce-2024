const razorpay = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// CREATE ORDER - Initiates Razorpay Payment and Stores Order in DB
const createOrder = async(req, res) => {
    try {
        const {
            userId,
            cartItems,
            addressInfo,
            orderStatus,
            paymentMethod,
            paymentStatus,
            totalAmount,
            orderDate,
            orderUpdateDate,
            paymentId,
            payerId,
            cartId,
            assignedTo,
        } = req.body;

        console.log("Creating order with total amount:", totalAmount);

        // Create a new order in the database first
        const newlyCreatedOrder = new Order({
            userId,
            cartId,
            cartItems,
            addressInfo,
            orderStatus,
            paymentMethod: "razorpay", // Change payment method to Razorpay
            paymentStatus,
            totalAmount,
            orderDate,
            orderUpdateDate,
            paymentId,
            payerId,
            assignedTo,
        });

        await newlyCreatedOrder.save();
        console.log("Order saved to database with ID:", newlyCreatedOrder._id);

        // Create Razorpay order
        const receipt = `receipt_${newlyCreatedOrder._id}`;
        console.log("Creating Razorpay order with receipt:", receipt);

        const razorpayOrderResult = await razorpay.createRazorpayOrder(totalAmount, receipt);
        console.log("Razorpay order result:", razorpayOrderResult);

        if (!razorpayOrderResult.success) {
            console.error("Failed to create Razorpay order:", razorpayOrderResult.error);
            return res.status(500).json({
                success: false,
                message: "Error while creating Razorpay order",
                error: razorpayOrderResult.error
            });
        }

        // Return the Razorpay order details to the client
        const responseData = {
            success: true,
            orderId: newlyCreatedOrder._id,
            razorpayOrderId: razorpayOrderResult.order.id,
            amount: razorpayOrderResult.order.amount,
            currency: razorpayOrderResult.order.currency,
            razorpayKeyId: razorpay.KEY_ID
        };

        console.log("Sending response to client:", responseData);
        res.status(201).json(responseData);
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the order",
            error: error.message
        });
    }
};

// CAPTURE PAYMENT - Finalizes the Order after Razorpay Payment
const capturePayment = async(req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        console.log("Capturing payment with details:", {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        });

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            console.error("Missing required payment parameters");
            return res.status(400).json({
                success: false,
                message: "Missing required payment parameters"
            });
        }

        // Verify the payment signature
        const isValidSignature = razorpay.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        console.log("Signature verification result:", isValidSignature);

        if (!isValidSignature.success) {
            console.error("Invalid payment signature:", isValidSignature.error);
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
                error: isValidSignature.error
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            console.error("Order not found with ID:", orderId);
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        console.log("Found order:", order._id);

        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentId = razorpay_payment_id;
        order.payerId = razorpay_order_id; // Using this field to store Razorpay order ID

        // Reduce stock for each product
        for (let item of order.cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                console.error("Product not found:", item.title);
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.title}`,
                });
            }

            if (product.totalStock < item.quantity) {
                console.error("Insufficient stock for product:", product.title);
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.title}`,
                });
            }

            product.totalStock -= item.quantity;
            await product.save();
            console.log(`Updated stock for product ${product.title}: ${product.totalStock}`);
        }

        // Remove the cart after order confirmation
        if (order.cartId) {
            await Cart.findByIdAndDelete(order.cartId);
            console.log("Removed cart:", order.cartId);
        }

        await order.save();
        console.log("Order updated successfully");

        res.status(200).json({
            success: true,
            message: "Order confirmed and payment captured",
            data: order,
        });
    } catch (error) {
        console.error("Capture Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while capturing the payment",
            error: error.message
        });
    }
};

// GET ALL ORDERS BY USER - Includes assignedTo field
const getAllOrdersByUser = async(req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ userId });

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user",
            });
        }

        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.log("Get Orders Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching orders",
        });
    }
};

// GET ORDER DETAILS BY ORDER ID - Includes assignedTo
const getOrderDetails = async(req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.log("Get Order Details Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching order details",
        });
    }
};

module.exports = {
    createOrder,
    capturePayment,
    getAllOrdersByUser,
    getOrderDetails,
};