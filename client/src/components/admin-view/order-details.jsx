import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(orderDetails, "orderDetailsorderDetails");

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

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
              <span className="font-semibold text-primary">Customer: {orderDetails?.userName || "Anonymous User"}</span>
              <span className="break-words">{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              {orderDetails?.addressInfo?.notes && (
                <div className="mt-1 p-2 bg-blue-50 rounded-md">
                  <span className="font-medium text-blue-800">Notes:</span>
                  <span className="break-words block mt-1">{orderDetails?.addressInfo?.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  // { id: "inProcess", label: "In Process" },
                  // { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  // { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
