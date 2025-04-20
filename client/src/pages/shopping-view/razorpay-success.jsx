import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function RazorpaySuccessPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

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

        const result = await dispatch(
          capturePayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId: parsedOrderId
          })
        );

        console.log("Payment verification result:", result);

        setIsProcessing(false);
        if (result?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");
          navigate("/shop/payment-success");
        } else {
          setError(result?.error?.message || "Payment verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Payment capture error:", err);
        setIsProcessing(false);
        setError("An error occurred while processing your payment.");
      }
    };

    verifyPayment();
  }, [dispatch, location.search, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isProcessing
            ? "Processing Payment...Please wait!"
            : error
              ? error
              : "Payment successful! Redirecting..."}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default RazorpaySuccessPage;
