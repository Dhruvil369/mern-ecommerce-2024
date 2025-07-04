import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { io } from "socket.io-client";
import { apiUrl } from "../../lib/api";

const socket = io(import.meta.env.VITE_BASE_URL);

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server with ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      resolve(true);
      return;
    }

    // If not loaded, create and append the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Error loading Razorpay script:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const {
    orderId,
    razorpayOrderId,
    razorpayAmount,
    razorpayCurrency,
    razorpayKeyId
  } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems?.items?.length > 0
      ? cartItems.items.reduce(
          (sum, item) =>
            sum +
            ((item?.salePrice > 0 ? item?.salePrice : item?.price) *
              item?.quantity),
          0
        )
      : 0;

  // Load Razorpay script when component mounts
  useEffect(() => {
    const loadScript = async () => {
      const scriptLoaded = await loadRazorpayScript();
      setIsRazorpayLoaded(scriptLoaded);
    };
    loadScript();
  }, []);

  // Handle Razorpay payment when order is created
  useEffect(() => {
    if (razorpayOrderId && razorpayAmount && razorpayKeyId && isRazorpayLoaded) {
      try {
        console.log("Initializing Razorpay with:", {
          orderId: razorpayOrderId,
          amount: razorpayAmount,
          keyId: razorpayKeyId
        });

        const options = {
          key: razorpayKeyId,
          amount: razorpayAmount,
          currency: razorpayCurrency || 'INR',
          name: 'Your E-Commerce Store',
          description: 'Purchase from Your E-Commerce Store',
          order_id: razorpayOrderId,
          handler: function (response) {
            console.log("Razorpay payment successful:", response);
            // Redirect to success page with payment details
            const url = `/shop/razorpay-success?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`;
            navigate(url);
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: currentSelectedAddress?.phone || ''
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: function() {
              console.log('Payment modal closed');
              setIsPaymentStart(false);
            }
          }
        };

        if (window.Razorpay) {
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
        } else {
          console.error("Razorpay SDK not loaded");
          toast({
            title: "Payment gateway not loaded. Please try again.",
            variant: "destructive",
          });
          setIsPaymentStart(false);
        }
      } catch (error) {
        console.error("Error initializing Razorpay:", error);
        toast({
          title: "Error initializing payment. Please try again.",
          variant: "destructive",
        });
        setIsPaymentStart(false);
      }
    }
  }, [razorpayOrderId, razorpayAmount, razorpayKeyId, isRazorpayLoaded, navigate, user, currentSelectedAddress, toast, setIsPaymentStart]);

  function handleInitiateRazorpayPayment() {
    if (!cartItems?.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (!data?.payload?.success) {
        setIsPaymentStart(false);
        toast({
          title: "Failed to create order. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("✅ Order created, emitting socket event...");
        socket.emit("neworder", orderData);
      }
    }).catch(error => {
      setIsPaymentStart(false);
      toast({
        title: "An error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Order creation error:", error);
    });
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-3 sm:mt-5 p-3 sm:p-5">
        <div className="order-2 md:order-1">
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        </div>
        <div className="flex flex-col gap-3 sm:gap-4 order-1 md:order-2">
          <div className="bg-white rounded-lg border p-3 sm:p-4 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>
            {cartItems?.items?.length > 0 ? (
              cartItems.items.map((item) => (
                <UserCartItemsContent key={item._id} cartItem={item} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Your cart is empty</p>
            )}

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-bold text-base sm:text-lg">Total</span>
                <span className="font-bold text-base sm:text-lg">₹{totalCartAmount}</span>
              </div>
            </div>
            <div className="mt-4 w-full">
              <Button
                onClick={handleInitiateRazorpayPayment}
                className="w-full text-sm sm:text-base"
                disabled={isPaymentStart}
              >
                {isPaymentStart
                  ? "Processing Payment..."
                  : "Pay with Razorpay"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
