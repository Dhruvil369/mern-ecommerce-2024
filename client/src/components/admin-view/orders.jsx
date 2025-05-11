import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  getUnassignedOrders,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  acceptOrder,
  getAcceptedOrdersByAdmin,
} from "@/store/admin/order-slice";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import AdminOrderDetailsView from "./order-details";

// Initialize socket
const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"), // or however you're storing it
  },
});


function AdminOrdersView() {
  const dispatch = useDispatch();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { unassignedOrders, acceptedOrders, orderDetails } = useSelector(
    (state) => state.adminOrder
  );
  // const currentAdminId = useSelector((state) => state.auth.user._id);

  // 🔍 Add logs here

  // Fetch orders initially and set up polling
  useEffect(() => {
    // Initial fetch
    dispatch(getUnassignedOrders());
    dispatch(getAcceptedOrdersByAdmin());

    // Set up polling to refresh orders every 30 seconds
    const intervalId = setInterval(() => {
      console.log("🔄 Polling for new orders...");
      dispatch(getUnassignedOrders());
      dispatch(getAcceptedOrdersByAdmin());
    }, 30000); // 30 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);
  console.log("🟡 Unassigned Orders:", unassignedOrders);
  console.log("🟢 Accepted Orders:", acceptedOrders);

  // Socket listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Admin socket connected");
    });

    const handleNewOrder = (orderData) => {
      console.log("📦 New order received via socket:", orderData);

      // Show toast notification
      toast.success(
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span>📦 New order received!</span>
            <span className="text-xs">ID: {orderData._id}</span>
          </div>
          {orderData.userName && (
            <div className="text-xs mt-1">Customer: {orderData.userName}</div>
          )}
          <div className="text-xs mt-1">Amount: ₹{orderData.totalAmount}</div>
        </div>,
        {
          duration: 6000,
          style: {
            background: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "12px",
          },
          icon: "🚀",
        }
      );

      // Refresh the orders list immediately
      console.log("🔄 Refreshing orders list after new order...");
      dispatch(getUnassignedOrders());

      // Play a notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play();
      } catch (error) {
        console.log("Could not play notification sound:", error);
      }
    };

    socket.on("admin_new_order", handleNewOrder);
    socket.on("order_accepted", (orderId) => {
      console.log(`✅ Order ${orderId} accepted via socket`);

      // Show toast notification
      toast.success(
        <div className="flex items-center space-x-2">
          <span>✅ Order accepted!</span>
          <span className="text-xs">ID: {orderId}</span>
        </div>,
        {
          duration: 3000,
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "12px",
          },
        }
      );

      // Refresh the orders lists
      dispatch(getUnassignedOrders());
      dispatch(getAcceptedOrdersByAdmin());
    });

    return () => {
      socket.off("admin_new_order", handleNewOrder);
      socket.off("order_accepted");
    };
  }, [dispatch]);

  const [acceptingOrderId, setAcceptingOrderId] = useState(null);

  const handleAccept = async (id) => {
    try {
      // Set loading state
      setAcceptingOrderId(id);

      // Dispatch the accept order action
      const result = await dispatch(acceptOrder({ id }));

      if (result.meta.requestStatus === "fulfilled") {
        // Emit socket event
        socket.emit("order_accepted", id);

        // Show success toast
        toast.success("✅ Order accepted successfully!");

        // Refresh the orders lists
        dispatch(getUnassignedOrders());
        dispatch(getAcceptedOrdersByAdmin());

        console.log("✅ Order accepted successfully:", id);
      } else {
        // Show error toast
        toast.error("❌ Failed to accept order.");
        console.error("❌ Failed to accept order:", result.error);
      }
    } catch (error) {
      // Show error toast
      toast.error("❌ An error occurred while accepting the order.");
      console.error("❌ Error accepting order:", error);
    } finally {
      // Clear loading state
      setAcceptingOrderId(null);
    }
  };

  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const handleViewDetails = async (id) => {
    try {
      // Set loading state
      setSelectedOrderId(id);
      setLoadingOrderDetails(true);

      // Fetch order details
      const result = await dispatch(getOrderDetailsForAdmin(id));

      if (result.meta.requestStatus === "fulfilled") {
        // Open dialog when data is ready
        setOpenDetailsDialog(true);
      } else {
        // Show error toast
        toast.error("Failed to load order details");
        console.error("❌ Failed to load order details:", result.error);
      }
    } catch (error) {
      // Show error toast
      toast.error("An error occurred while loading order details");
      console.error("❌ Error loading order details:", error);
    } finally {
      // Clear loading state
      setLoadingOrderDetails(false);
    }
  };


  const closeDialog = () => {
    setOpenDetailsDialog(false);
    dispatch(resetOrderDetails());
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Unassigned Orders */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">🟡 Unassigned Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Customer</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Total</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {unassignedOrders.length > 0 ? (
                [...unassignedOrders].reverse().map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">{order.orderDate.split("T")[0]}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                      {order.userName || "Anonymous User"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">₹{order.totalAmount}</TableCell>
                    <TableCell className="admin-orders-actions">
                      <Button
                        onClick={() => handleViewDetails(order._id)}
                        size="sm"
                        className="admin-orders-button"
                        disabled={loadingOrderDetails && selectedOrderId === order._id}
                      >
                        {loadingOrderDetails && selectedOrderId === order._id ? (
                          <>
                            <span className="animate-spin mr-1">⏳</span>
                            Loading...
                          </>
                        ) : (
                          'View'
                        )}
                      </Button>
                      <Button
                        onClick={() => handleAccept(order._id)}
                        size="sm"
                        className="bg-green-600 text-white admin-orders-button"
                        disabled={acceptingOrderId === order._id}
                      >
                        {acceptingOrderId === order._id ? (
                          <>
                            <span className="animate-spin mr-1">⏳</span>
                            Accepting...
                          </>
                        ) : (
                          'Accept'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No unassigned orders.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>

      {/* Accepted Orders */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">🟢 Accepted Orders (You)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Customer</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Total</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {acceptedOrders.length > 0 ? (
                [...acceptedOrders].reverse().map((order) => (
                  <TableRow key={order._id}>
                  <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">{order.orderDate.split("T")[0]}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                    {order.userName || "Anonymous User"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">₹{order.totalAmount}</TableCell>
                  <TableCell className="admin-orders-actions items-start xs:items-center">
                    <span className="text-xs sm:text-sm">{order.orderStatus}</span>
                    <Button
                      onClick={() => handleViewDetails(order._id)}
                      size="sm"
                      className="admin-orders-button"
                      disabled={loadingOrderDetails && selectedOrderId === order._id}
                    >
                      {loadingOrderDetails && selectedOrderId === order._id ? (
                        <>
                          <span className="animate-spin mr-1">⏳</span>
                          Loading...
                        </>
                      ) : (
                        'View'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No accepted orders.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>

      {/* Shared Dialog */}
      <Dialog open={openDetailsDialog} onOpenChange={closeDialog}>
        <DialogContent
          className="max-w-[95vw] xs:max-w-[90vw] sm:max-w-[80vw] md:max-w-3xl w-full p-0 overflow-hidden"
          style={{ maxHeight: "90vh" }} // Limit height of the entire modal
        >
          <div className="overflow-y-auto max-h-[80vh] p-0">
            <AdminOrderDetailsView orderDetails={orderDetails} />
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default AdminOrdersView;
