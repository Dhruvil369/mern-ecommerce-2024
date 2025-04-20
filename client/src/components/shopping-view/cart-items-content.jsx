import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  const unitPrice =
    cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price;

  return (
    <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b last:border-b-0 last:mb-0 last:pb-0">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover"
      />
      <div className="flex-1 min-w-0"> {/* min-width prevents flex item from shrinking below content size */}
        <h3 className="font-extrabold text-sm sm:text-base truncate">{cartItem?.title}</h3>
        <div className="flex items-center gap-1 sm:gap-2 mt-1">
          <Button
            variant="outline"
            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold text-sm sm:text-base">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end ml-1 sm:ml-2">
        <p className="font-semibold text-sm sm:text-base">
          ₹{(unitPrice * cartItem?.quantity).toFixed(2)}
        </p>
        <span className="text-xs text-muted-foreground hidden sm:inline-block">
          ₹{unitPrice.toFixed(2)} × {cartItem?.quantity}
        </span>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={16}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
