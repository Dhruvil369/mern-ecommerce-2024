import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <DialogContent className="sm:max-w-[600px] p-3 sm:p-6">
      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-1 sm:gap-2">
          <div className="flex mt-3 sm:mt-6 items-center justify-between flex-wrap gap-1">
            <p className="font-medium text-xs sm:text-sm">Order ID</p>
            <Label className="text-xs sm:text-sm break-all max-w-[200px] text-right">{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-1 sm:mt-2 items-center justify-between">
            <p className="font-medium text-xs sm:text-sm">Order Date</p>
            <Label className="text-xs sm:text-sm">{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-1 sm:mt-2 items-center justify-between">
            <p className="font-medium text-xs sm:text-sm">Order Price</p>
            <Label className="text-xs sm:text-sm">₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-1 sm:mt-2 items-center justify-between">
            <p className="font-medium text-xs sm:text-sm">Payment method</p>
            <Label className="text-xs sm:text-sm">{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-1 sm:mt-2 items-center justify-between">
            <p className="font-medium text-xs sm:text-sm">Payment Status</p>
            <Label className="text-xs sm:text-sm">{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-1 sm:mt-2 items-center justify-between">
            <p className="font-medium text-xs sm:text-sm">Order Status</p>
            <Label>
              <Badge
                className={`py-0.5 sm:py-1 px-2 sm:px-3 text-xs ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-3 sm:gap-4">
          <div className="grid gap-1 sm:gap-2">
            <div className="font-medium text-xs sm:text-sm">Order Details</div>
            <ul className="grid gap-2 sm:gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, index) => (
                    <li key={index} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 text-xs sm:text-sm border-b pb-2">
                      <span className="truncate max-w-[150px] xs:max-w-none">Title: {item.title}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ₹{item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4">
          <div className="grid gap-1 sm:gap-2">
            <div className="font-medium text-xs sm:text-sm">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground text-xs sm:text-sm">
              <span>{user.userName}</span>
              <span className="break-words">{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span className="break-words">{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
