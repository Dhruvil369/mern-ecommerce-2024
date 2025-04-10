const Order = require("../../models/Order");

const getAllOrdersOfAllUsers = async(req, res) => {
    try {
        const orders = await Order.find({});

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "No orders found!",
            });
        }

        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!",
        });
    }
};

const getOrderDetailsForAdmin = async(req, res) => {
    try {
        const { id } = req.params;
        console.log('Debug:', id);
        console.log("Decoded user from token:", req.params);

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found!",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured!",
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
        const orders = await Order.find({ assignedTo: null });
        // const orders = await Order.find({ status: "unassigned" });
        res.status(200).json({
            success: true,
            data: orders,
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
        // const orders = await Order.find({ assignedTo: adminId }).populate("user");
        const orders = await Order.find({ assignedTo: adminId })
            .populate("user")
            .populate("assignedTo"); // ← optional

        console.log("This is admin id in getAcceptedOrdersByAdmin API", adminId);
        console.log("This is orders id in getAcceptedOrdersByAdmin API", orders);
        res.status(200).json({ success: true, data: orders });
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