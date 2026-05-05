import logout from "@/actions/logout";
import { LogOut, LogOutIcon, LucideLogOut } from "lucide-react";
import LogOutButton from "../auth/logout-btn";
import { Button } from "../button";

export default function UserMenu() {
    return <div className="flex justify-center h-14 w-full bg-gray-200" onClick={logout}>
        <LogOutButton className="p-2">
            <LucideLogOut />
        </LogOutButton>
    </div>
}