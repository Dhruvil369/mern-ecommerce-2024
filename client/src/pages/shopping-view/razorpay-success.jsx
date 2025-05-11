import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { capturePayment, getAllOrdersByUserId } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { io } from "socket.io-client";
import axios from "axios";

function RazorpaySuccessPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the payment details from URL search params
        const searchParams = new URLSearchParams(location.search);
        const razorpay_payment_id = searchParams.get("razorpay_payment_id");
        const razorpay_order_id = searchParams.get("razorpay_order_id");
        const razorpay_signature = searchParams.get("razorpay_signature");

        console.log("Payment parameters:", { razorpay_payment_id, razorpay_order_id, razorpay_signature });

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
          setIsProcessing(false);
          setError("Missing payment information. Please try again.");
          return;
        }

        const orderId = sessionStorage.getItem("currentOrderId");
        if (!orderId) {
          setIsProcessing(false);
          setError("Order information not found. Please try again.");
          return;
        }

        const parsedOrderId = JSON.parse(orderId);
        console.log("Verifying payment for order:", parsedOrderId);

        // Save payment details for display
        setPaymentDetails({
          orderId: parsedOrderId,
          paymentId: razorpay_payment_id,
          amount: "Processing..." // Will be updated after verification
        });

        try {
          const result = await dispatch(
            capturePayment({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              orderId: parsedOrderId
            })
          );

          console.log("Payment verification result:", result);

          // Refresh the order list to include the new order
          if (user?.id) {
            console.log("Refreshing orders for user:", user.id);

            // Try multiple times to ensure the order is fetched
            const refreshOrders = async () => {
              let attempts = 0;
              const maxAttempts = 3;
              let success = false;

              while (attempts < maxAttempts && !success) {
                try {
                  attempts++;
                  console.log(`Attempt ${attempts} to refresh orders...`);

                  const ordersResult = await dispatch(getAllOrdersByUserId(user.id)).unwrap();
                  console.log("Orders refreshed successfully:", ordersResult);

                  // Check if the new order is in the list
                  if (ordersResult.data && ordersResult.data.some(order => order._id === parsedOrderId)) {
                    console.log("New order found in the order list!");
                    success = true;
                  } else {
                    console.log("New order not found in the list yet, will retry...");
                    // Wait a bit before trying again
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                } catch (error) {
                  console.error(`Error refreshing order list (attempt ${attempts}):`, error);
                  // Wait a bit before trying again
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }

              if (!success) {
                console.log("Could not confirm order in history after multiple attempts. User may need to refresh manually.");
              }
            };

            refreshOrders();
          }

          // Emit socket event for order status update
          try {
            const socket = io("http://localhost:5000");
            socket.emit("order_status_updated", {
              orderId: parsedOrderId,
              status: "confirmed"
            });
          } catch (socketError) {
            console.error("Socket error:", socketError);
            // Continue with the flow even if socket fails
          }

          setIsProcessing(false);

          // Check if the payment was successful
          // We consider it successful if either:
          // 1. The API returned success: true
          // 2. We got a rejected action but the order was created (special case for test mode)
          const isSuccess = result?.payload?.success ||
                          (result?.type?.includes('rejected') && result?.payload?.success);

          if (isSuccess) {
            // Update payment details with actual amount if available
            if (result.payload?.data?.totalAmount) {
              setPaymentDetails(prev => ({
                ...prev,
                amount: `₹${result.payload.data.totalAmount}`
              }));
            } else {
              // If we don't have the amount, fetch the order details
              try {
                const orderResponse = await axios.get(
                  `http://localhost:5000/api/shop/order/details/${parsedOrderId}`
                );
                if (orderResponse.data?.success && orderResponse.data?.data?.totalAmount) {
                  setPaymentDetails(prev => ({
                    ...prev,
                    amount: `₹${orderResponse.data.data.totalAmount}`
                  }));
                }
              } catch (orderError) {
                console.error("Error fetching order details:", orderError);
                // Continue with the flow even if this fails
              }
            }

            // Show success toast - simple version without mentioning order history
            toast({
              title: "Order Placed Successfully!",
              description: "Your order has been confirmed and is being processed.",
              variant: "default",
            });

            // Clear cart after successful order
            try {
              // Clear the cart from localStorage if it exists
              localStorage.removeItem("cart");

              // Emit event to update cart count in the header
              const cartUpdateEvent = new CustomEvent('cartUpdated', { detail: { count: 0 } });
              window.dispatchEvent(cartUpdateEvent);

              console.log("Cart cleared after successful order");
            } catch (cartError) {
              console.error("Error clearing cart:", cartError);
              // Continue with the flow even if this fails
            }

            sessionStorage.removeItem("currentOrderId");

            // Redirect after a short delay to allow the user to see the success message
            setTimeout(() => {
              // Navigate to shop home page instead of orders page
              navigate("/shop/home");
              console.log("Navigating to /shop/home");

              // No additional toast after navigation
            }, 3000);
          } else {
            // Even if verification failed, the order might still be created
            // So we'll show a more helpful message
            setError(
              (result?.error?.message ||
              "Payment verification had issues, but your order may still be processing. Please check your order history or contact support.") +
              " Redirecting to home page in 5 seconds..."
            );

            // Still remove the order ID from session storage
            sessionStorage.removeItem("currentOrderId");

            // Redirect to home page after a short delay even in case of error
            setTimeout(() => {
              navigate("/shop/home");
            }, 5000);
          }
        } catch (dispatchError) {
          console.error("Error dispatching payment capture:", dispatchError);
          setIsProcessing(false);

          // Even if there's an error, the order might still be created
          // So we'll show a more helpful message
          setError(
            "There was an issue processing your payment, but your order may still be created. Please check your order history. Redirecting to home page in 5 seconds..."
          );

          // Still remove the order ID from session storage
          sessionStorage.removeItem("currentOrderId");

          // Redirect to home page after a short delay even in case of error
          setTimeout(() => {
            navigate("/shop/home");
          }, 5000);
        }
      } catch (err) {
        console.error("Payment capture error:", err);
        setIsProcessing(false);
        setError("An error occurred while processing your payment.");
      }
    };

    verifyPayment();
  }, [dispatch, location.search, navigate, user, toast]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...Please wait!
              </div>
            ) : error ? (
              <div className="text-red-500">
                <svg className="h-10 w-10 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            ) : (
              <div className="text-green-600">
                <svg className="h-10 w-10 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Payment Successful!
              </div>
            )}
          </CardTitle>
        </CardHeader>

        {!isProcessing && !error && paymentDetails && (
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Order ID:</div>
                <div className="font-medium">{paymentDetails.orderId.substring(0, 12)}...</div>

                <div className="text-gray-500">Payment ID:</div>
                <div className="font-medium">{paymentDetails.paymentId.substring(0, 12)}...</div>

                <div className="text-gray-500">Amount:</div>
                <div className="font-medium">{paymentDetails.amount}</div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Redirecting to shop home page in a moment...
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default RazorpaySuccessPage;
