const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// CREATE ORDER - Initiates PayPal Payment and Stores Order in DB
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

        const create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            redirect_urls: {
                return_url: "http://localhost:5173/shop/paypal-return",
                cancel_url: "http://localhost:5173/shop/paypal-cancel",
            },
            transactions: [{
                item_list: {
                    items: cartItems.map((item) => ({
                        name: item.title,
                        sku: item.productId,
                        price: item.price.toFixed(2),
                        currency: "USD",
                        quantity: item.quantity,
                    })),
                },
                amount: {
                    currency: "USD",
                    total: totalAmount.toFixed(2),
                },
                description: "Order from online store",
            }, ],
        };

        paypal.payment.create(create_payment_json, async(error, paymentInfo) => {
            if (error) {
                console.log("PayPal Error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error while creating PayPal payment",
                });
            }

            const newlyCreatedOrder = new Order({
                userId,
                cartId,
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
                assignedTo,
            });

            await newlyCreatedOrder.save();

            const approvalURL = paymentInfo.links.find(
                (link) => link.rel === "approval_url"
            ).href;

            res.status(201).json({
                success: true,
                approvalURL,
                orderId: newlyCreatedOrder._id,
            });
        });
    } catch (error) {
        console.log("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the order",
        });
    }
};

// CAPTURE PAYMENT - Finalizes the Order after PayPal Payment Approval
const capturePayment = async(req, res) => {
    try {
        const { paymentId, payerId, orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentId = paymentId;
        order.payerId = payerId;

        // Reduce stock for each product
        for (let item of order.cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.title}`,
                });
            }

            if (product.totalStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.title}`,
                });
            }

            product.totalStock -= item.quantity;
            await product.save();
        }

        // Remove the cart after order confirmation
        await Cart.findByIdAndDelete(order.cartId);

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order confirmed and payment captured",
            data: order,
        });
    } catch (error) {
        console.log("Capture Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while capturing the payment",
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