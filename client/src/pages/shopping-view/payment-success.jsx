import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function PaymentSuccessPage() {
  const navigate = useNavigate();

  // Auto-redirect to home page after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/shop/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Card className="max-w-md mx-auto mt-8 p-6">
      <CardHeader className="text-center">
        <div className="text-green-600 mb-4">
          <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-600 mb-6">
          Your order has been placed successfully and is being processed.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/shop/home")}>
            Continue Shopping
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Redirecting to home page in a moment...
        </p>
      </CardContent>
    </Card>
  );
}

export default PaymentSuccessPage;
