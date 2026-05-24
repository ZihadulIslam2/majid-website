"use client";

import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";
import { ModeToggle } from "../website/ModeToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Props {
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setOpenSidebar }: Props) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        {isAuthenticated && (
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={() => setOpenSidebar(true)}
          >
            <Menu size={20} />
          </Button>
        )}

        <div className="flex-1 max-w-xl"></div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        {isAuthenticated ? (
          <NotificationDropdown role="shopkeeper" />
        ) : (
          <Link href="/auth/login">
            <Button className="bg-[#84CC16] hover:bg-[#84CC16]/95 text-white font-extrabold px-6 py-2.5 rounded-full text-sm shadow-md transition-all cursor-pointer">
              Login / Sign Up
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
