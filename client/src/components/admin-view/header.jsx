import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-background border-b">
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block h-8 w-8 p-0 sm:h-10 sm:w-10 sm:p-2">
        <AlignJustify className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          size="sm"
          className="inline-flex gap-1 sm:gap-2 items-center rounded-md px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow h-8 sm:h-10"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
