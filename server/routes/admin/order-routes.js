const express = require("express");

const {
    getAllOrdersOfAllUsers,
    getOrderDetailsForAdmin,
    updateOrderStatus,
    getUnassignedOrders,
    acceptOrder,
    getAcceptedOrdersByAdmin,
    markOrderAsDelivered,
} = require("../../controllers/admin/order-controller");

const { adminMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.get("/get", adminMiddleware, getAllOrdersOfAllUsers);
router.get("/details/:id", adminMiddleware, getOrderDetailsForAdmin);
router.put("/update/:id", adminMiddleware, updateOrderStatus);

router.get("/unassigned", adminMiddleware, getUnassignedOrders);
router.put("/accept/:id", adminMiddleware, acceptOrder);
router.get("/accepted", adminMiddleware, getAcceptedOrdersByAdmin);
router.put("/delivered/:id", adminMiddleware, markOrderAsDelivered);

module.exports = router;