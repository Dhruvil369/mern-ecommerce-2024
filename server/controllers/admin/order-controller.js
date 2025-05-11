const Order = require("../../models/Order");

const getAllOrdersOfAllUsers = async(req, res) => {
    try {
        // Populate the user field to get user information
        const orders = await Order.find({}).populate('user');

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "No orders found!",
            });
        }

        // Process orders to ensure userName is available for all orders
        const processedOrders = orders.map(order => {
            const orderObj = order.toObject();

            // If user field is populated, use it for userName
            if (orderObj.user && orderObj.user.userName) {
                orderObj.userName = orderObj.user.userName;
            }
            // If user field is not populated but userId exists, mark as legacy order
            else if (orderObj.userId) {
                orderObj.userName = "User #" + orderObj.userId.substring(0, 8);
            }
            // If neither exists, mark as anonymous
            else {
                orderObj.userName = "Anonymous User";
            }

            return orderObj;
        });

        res.status(200).json({
            success: true,
            data: processedOrders,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occurred!",
        });
    }
};

const getOrderDetailsForAdmin = async(req, res) => {
    try {
        const { id } = req.params;
        console.log('Debug:', id);
        console.log("Decoded user from token:", req.params);

        // Populate the user field to get user information
        const order = await Order.findById(id).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!",
            });
        }

        // Process order to ensure userName is available
        const orderObj = order.toObject();

        // If user field is populated, use it for userName
        if (orderObj.user && orderObj.user.userName) {
            orderObj.userName = orderObj.user.userName;
        }
        // If user field is not populated but userId exists, mark as legacy order
        else if (orderObj.userId) {
            orderObj.userName = "User #" + orderObj.userId.substring(0, 8);
        }
        // If neither exists, mark as anonymous
        else {
            orderObj.userName = "Anonymous User";
        }

        res.status(200).json({
            success: true,
            data: orderObj,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occurred!",
        });
    }
};

const updateOrderStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!",
            });
        }

        await Order.findByIdAndUpdate(id, { orderStatus });

        res.status(200).json({
            success: true,
            message: "Order status is updated successfully!",
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!",
        });
    }
};

const getUnassignedOrders = async(req, res) => {
    try {
        // Populate the user field to get user information
        const orders = await Order.find({ assignedTo: null }).populate('user');

        // Process orders to ensure userName is available for all orders
        const processedOrders = orders.map(order => {
            const orderObj = order.toObject();

            // If user field is populated, use it for userName
            if (orderObj.user && orderObj.user.userName) {
                orderObj.userName = orderObj.user.userName;
            }
            // If user field is not populated but userId exists, mark as legacy order
            else if (orderObj.userId) {
                orderObj.userName = "User #" + orderObj.userId.substring(0, 8);
            }
            // If neither exists, mark as anonymous
            else {
                orderObj.userName = "Anonymous User";
            }

            return orderObj;
        });

        res.status(200).json({
            success: true,
            data: processedOrders,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// const acceptOrder = async(req, res) => {
//     try {
//         const { id } = req.params;
//         const { adminId } = req.body; // Make sure you extract admin info from token/session

//         const order = await Order.findById(id);

//         if (!order || order.assignedTo) {
//             return res.status(400).json({ success: false, message: "Order not available or already accepted" });
//         }

//         order.assignedTo = adminId;
//         order.orderStatus = "Accepted";
//         await order.save();

//         res.status(200).json({ success: true, message: "Order accepted successfully!" });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ success: false, message: "Error accepting order" });
//     }
// };
const acceptOrder = async(req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        console.log('Debug:', adminId);
        console.log(req.user.id);
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // If already assigned, don't let another admin accept it
        if (order.assignedTo) {
            return res.status(400).json({ success: false, message: "Order already accepted" });
        }

        order.assignedTo = adminId;
        order.orderStatus = "assigned"; // optional: ensure it's marked as pending
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAcceptedOrdersByAdmin = async(req, res) => {
    try {
        console.log("req.user in getAcceptedOrdersByAdmin", req.user);

        const adminId = req.user.id;
        // Populate both user and assignedTo fields
        const orders = await Order.find({ assignedTo: adminId })
            .populate("user")
            .populate("assignedTo");

        // Process orders to ensure userName is available for all orders
        const processedOrders = orders.map(order => {
            const orderObj = order.toObject();

            // If user field is populated, use it for userName
            if (orderObj.user && orderObj.user.userName) {
                orderObj.userName = orderObj.user.userName;
            }
            // If user field is not populated but userId exists, mark as legacy order
            else if (orderObj.userId) {
                orderObj.userName = "User #" + orderObj.userId.substring(0, 8);
            }
            // If neither exists, mark as anonymous
            else {
                orderObj.userName = "Anonymous User";
            }

            return orderObj;
        });

        console.log("This is admin id in getAcceptedOrdersByAdmin API", adminId);
        res.status(200).json({ success: true, data: processedOrders });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

const markOrderAsDelivered = async(req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;


        const order = await Order.findById(id);

        if (!order || order.assignedTo.toString() !== adminId) {
            return res.status(403).json({ success: false, message: "Not authorized to update this order" });
        }

        order.orderStatus = "Delivered";
        await order.save();

        res.status(200).json({ success: true, message: "Order marked as delivered" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Error updating order status" });
    }
};



module.exports = {
    getAllOrdersOfAllUsers,
    markOrderAsDelivered,
    getOrderDetailsForAdmin,
    updateOrderStatus,
    getUnassignedOrders,
    getAcceptedOrdersByAdmin,
    acceptOrder,
};