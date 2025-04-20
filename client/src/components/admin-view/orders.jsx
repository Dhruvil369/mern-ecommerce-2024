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

  // Fetch orders initially
  useEffect(() => {
    dispatch(getUnassignedOrders());
    dispatch(getAcceptedOrdersByAdmin());
  }, [dispatch]);
  console.log("🟡 Unassigned Orders:", unassignedOrders);
  console.log("🟢 Accepted Orders:", acceptedOrders);

  // Socket listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Admin socket connected");
    });

    const handleNewOrder = (orderData) => {
      console.log("Order Data",orderData);
      toast.success(
        <div className="flex items-center space-x-2">
          <span>📦 New order received!</span>
          <span className="text-xs">ID: {orderData._id}</span>
        </div>,
        {
          duration: 4000,
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
      dispatch(getUnassignedOrders());
    };

    socket.on("admin_new_order", handleNewOrder);
    socket.on("order_accepted", () => {
      dispatch(getUnassignedOrders());
      dispatch(getAcceptedOrdersByAdmin());
    });

    return () => {
      socket.off("admin_new_order", handleNewOrder);
      socket.off("order_accepted");
    };
  }, [dispatch]);

  const handleAccept = async (id) => {
    const result = await dispatch(acceptOrder({ id }));
    if (result.meta.requestStatus === "fulfilled") {
      socket.emit("order_accepted", id);
      toast.success("✅ Order accepted successfully!");
      // dispatch(getUnassignedOrders());
      // dispatch(getAcceptedOrdersByAdmin());
      console.log("Frontend toaster and dispach done");
    } else {
      toast.error("❌ Failed to accept order.");
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedOrderId(id);
    const result = await dispatch(getOrderDetailsForAdmin(id));
    if (result.meta.requestStatus === "fulfilled") {
      setOpenDetailsDialog(true); // open only when data is ready
    } else {
      toast.error("Failed to load order details");
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
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Total</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {unassignedOrders.length > 0 ? (
                [...unassignedOrders].reverse().map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">{order.orderDate.split("T")[0]}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">₹{order.totalAmount}</TableCell>
                    <TableCell className="admin-orders-actions">
                      <Button
                        onClick={() => handleViewDetails(order._id)}
                        size="sm"
                        className="admin-orders-button"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleAccept(order._id)}
                        size="sm"
                        className="bg-green-600 text-white admin-orders-button"
                      >
                        Accept
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
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
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Total</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {acceptedOrders.length > 0 ? (
                [...acceptedOrders].reverse().map((order) => (
                  <TableRow key={order._id}>
                  <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">{order.orderDate.split("T")[0]}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">₹{order.totalAmount}</TableCell>
                  <TableCell className="admin-orders-actions items-start xs:items-center">
                    <span className="text-xs sm:text-sm">{order.orderStatus}</span>
                    <Button
                      onClick={() => handleViewDetails(order._id)}
                      size="sm"
                      className="admin-orders-button"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>

                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
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
