import { Fragment, useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import io from "socket.io-client";
import { apiUrl } from "../../lib/api";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);
  const { toast } = useToast();

  // Function to refresh orders
  const refreshOrders = useCallback(() => {
    if (user?.id) {
      setIsRefreshing(true);
      dispatch(getAllOrdersByUserId(user.id))
        .then(() => {
          console.log("Orders refreshed successfully");
        })
        .catch((error) => {
          console.error("Error refreshing orders:", error);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  }, [dispatch, user]);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  // Initial load of orders
  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user]);

  // Set up socket connection for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    // Connect to socket server
    const socket = io(import.meta.env.VITE_BASE_URL);

    // Listen for new orders
    socket.on("admin_new_order", (data) => {
      console.log("New order received via socket:", data);

      // Check if this order belongs to the current user
      if (data.userId === user.id || data.user === user.id) {
        // Show notification
        toast({
          title: "New Order Created",
          description: `Your order #${data._id.substring(0, 8)} has been placed successfully.`,
          variant: "default",
        });

        // Refresh orders list
        refreshOrders();
      }
    });

    // Listen for order status updates
    socket.on("order_status_updated", (data) => {
      console.log("Order status updated:", data);
      refreshOrders();
    });

    // Clean up socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [user, refreshOrders, toast]);

  // Set up polling to refresh orders every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshOrders();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [refreshOrders]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="p-3 sm:p-4 md:p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base sm:text-lg md:text-xl">Order History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isRefreshing}
            className="text-xs sm:text-sm"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing && (!orderList || orderList.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-muted-foreground">Loading your orders...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orderList && orderList.length > 0 ? (
                  orderList.map((orderItem, index) => (
                    <TableRow key={orderItem?._id || index}>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm truncate max-w-[100px] md:max-w-none">
                        {orderItem?._id}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {orderItem?.orderDate.split("T")[0]}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`py-0.5 sm:py-1 px-1.5 sm:px-3 text-xs whitespace-nowrap ${
                            orderItem?.orderStatus === "confirmed" || orderItem?.orderStatus === "processing"
                              ? "bg-green-500"
                              : orderItem?.orderStatus === "rejected"
                              ? "bg-red-600"
                              : orderItem?.orderStatus === "delivered"
                              ? "bg-blue-500"
                              : "bg-black"
                          }`}
                        >
                          {orderItem?.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">₹{orderItem?.totalAmount}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleFetchOrderDetails(orderItem?._id)}
                          className="admin-orders-button"
                          size="sm"
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <p className="text-lg font-semibold text-gray-700 mb-1">No orders found</p>
                        <p className="text-sm text-muted-foreground">Your order history will appear here</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={() => {
          setOpenDetailsDialog(false);
          dispatch(resetOrderDetails());
        }}
      >
        <DialogContent
          className="max-w-[95vw] xs:max-w-[90vw] sm:max-w-[80vw] md:max-w-3xl w-full p-0 overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          <div className="overflow-y-auto max-h-[80vh] p-0">
            <ShoppingOrderDetailsView orderDetails={orderDetails} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShoppingOrders;
