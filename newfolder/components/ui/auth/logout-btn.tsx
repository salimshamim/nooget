"use client";

import logout from "@/actions/logout";
import { cn } from "@/lib/utils";

interface LogOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function LogOutButton({ children, className }: LogOutButtonProps) {
  const buttonAction = () => {
    console.log("Calling Logout Action");
    logout();
  };
  return (
    <span className={cn("cursor-pointer flex items-center justify-center", className)} onClick={buttonAction}>
      {children}
    </span>
  );
}
