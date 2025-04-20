import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";

function MenuItems({ isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className={`flex ${isMobile ? 'flex-col space-y-4 mt-6' : 'flex-row items-center gap-6'}`}>
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Button
          variant={isMobile ? "ghost" : "link"}
          onClick={() => handleNavigate(menuItem)}
          className={`${isMobile ? 'justify-start text-base w-full py-3' : 'text-sm font-medium'} cursor-pointer`}
          key={menuItem.id}
        >
          {menuItem.label}
        </Button>
      ))}
    </nav>
  );
}

function HeaderRightContent({ isMobile }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));
  }, [dispatch]);

  // Mobile view shows buttons in a column with labels
  if (isMobile) {
    return (
      <div className="flex flex-col w-full mt-6 space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">Your Account</h3>
        </div>

        <Button
          variant="ghost"
          className="justify-start text-base w-full py-3 flex items-center gap-3"
          onClick={() => navigate("/shop/account")}
        >
          <UserCog className="h-5 w-5" />
          <span>Account Settings</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start text-base w-full py-3 flex items-center gap-3"
          onClick={() => setOpenCartSheet(true)}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {(cartItems?.items?.length > 0) && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.items.length}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start text-base w-full py-3 flex items-center gap-3 text-red-500"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>

        <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={
              cartItems && cartItems.items && cartItems.items.length > 0
                ? cartItems.items
                : []
            }
          />
        </Sheet>
      </div>
    );
  }

  // Desktop view shows icons only
  return (
    <div className="flex items-center gap-4">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-5 h-5" />
          {(cartItems?.items?.length > 0) && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.items.length}
            </span>
          )}
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {user?.userName ? user.userName[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          <HousePlug className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">Ecommerce</span>
        </Link>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center">
                <Link to="/shop/home" className="flex items-center gap-2">
                  <HousePlug className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">Ecommerce</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <MenuItems isMobile={true} />
                <HeaderRightContent isMobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Menu */}
        <div className="hidden lg:block">
          <MenuItems isMobile={false} />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent isMobile={false} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
