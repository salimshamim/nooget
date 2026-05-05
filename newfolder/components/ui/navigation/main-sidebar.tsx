import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader
} from "@/components/ui/sidebar"
import TopHeader from "../top-header";
import { NavAdmin } from "../admin/sidebar-nav-admin";
import { currentUser } from "@/lib/auth";
// import LogOutButton from "../auth/logout-btn";
// import { Button } from "../button";
// import { LogOut } from "lucide-react";
import UserMenu from "../user-menu/user-menu";


export async function MainSidebar() {
    const user = await currentUser();
    return (
        <Sidebar>
            <TopHeader title="CDR Viewer" />

            <SidebarContent>
                {
                    user?.role === 'ADMIN' &&
                    <NavAdmin />
                }
            </SidebarContent>
            <SidebarFooter>
                <UserMenu />
            </SidebarFooter>
        </Sidebar>
    )
}
