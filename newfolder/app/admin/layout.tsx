import { MainSidebar } from "@/components/ui/navigation/main-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
    return <SidebarProvider>
        <MainSidebar />
        <SidebarTrigger />
        {children}
    </SidebarProvider>
}