import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";

function ShoppingAccount() {
  return (
    <div className="flex flex-col">
      <div className="container mx-auto grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-0">
        <div className="flex flex-col rounded-lg border bg-background p-3 sm:p-4 md:p-6 shadow-sm">
          <Tabs defaultValue="orders">
            <TabsList className="w-full sm:w-auto mb-4 sm:mb-6">
              <TabsTrigger value="orders" className="text-xs sm:text-sm md:text-base flex-1 sm:flex-none">Your Orders</TabsTrigger>
              <TabsTrigger value="address" className="text-xs sm:text-sm md:text-base flex-1 sm:flex-none">Address</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-0">
              <ShoppingOrders />
            </TabsContent>
            <TabsContent value="address" className="mt-0">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
