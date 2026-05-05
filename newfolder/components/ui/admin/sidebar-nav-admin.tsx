import { PlusCircleIcon } from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../sidebar';
import { AccountFormDialogue } from './account-form-dialogue';


export function NavAdmin() {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            tooltip="Quick Create"
                            className="cursor-pointer flex rounded-xl min-w-8 font-semibold h-12 text-lg justify-center pr-12 items-center bg-primary text-primary-foreground duration-200 ease-linear hover:bg-yellow-700/90 hover:text-primary-foreground active:bg-yellow-700/90 active:text-primary-foreground"
                        >
                            <PlusCircleIcon />
                            <AccountFormDialogue mode='create'>
                                <span className='select-none'>Add Account</span>
                            </AccountFormDialogue>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}