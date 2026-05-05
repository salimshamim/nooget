
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Edit, EllipsisVertical, Eye, HardDriveDownload, Trash2 } from "lucide-react";
import { AccountSchemaType } from "@/schema/AccountSchema";
import { AccountFormDialogue } from "./account-form-dialogue";
import { ExportDataDialogue } from "../view/export-data.dialogue";
import Link from "next/link";

export const AccountActionMenu = ({ data, selectAccountDelete }: { data: AccountSchemaType, selectAccountDelete: (accountId: string) => void }) => {
    console.log("Data in action menu", { data });


    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none flex items-center justify-center px-2 py-1">
                <EllipsisVertical className="flex h-full items-center justify-center" size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[150px] bg-white shadow-md rounded-md p-2 border border-gray-200">
                <DropdownMenuLabel className="font-semibold text-gray-700">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 border-gray-300" />
                <DropdownMenuItem className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                    <div
                        className="w-full"
                        onClick={(e) => e.stopPropagation()} // Prevent the Dropdown from closing
                    >
                        <AccountFormDialogue data={data}>
                            <div className="flex items-center justify-between">
                                <span>Edit</span>
                                <Edit size={18} />
                            </div>
                        </AccountFormDialogue>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                    <Link href={`/views/${data.username}`} target="_blank" className="flex items-center justify-between">
                        <span>View</span>
                        <Eye size={18} />
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                    <div
                        className="w-full"
                        onClick={(e) => e.stopPropagation()} // Prevent the Dropdown from closing
                    >
                        <ExportDataDialogue username={data.username}>
                            <div className="flex items-center justify-between">
                                <span>Export</span>
                                <HardDriveDownload className="text-yellow-600" size={18} />
                            </div>
                        </ExportDataDialogue>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex  px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-red-600" onClick={() => console.log("Delete Action data: ", { data })}>
                    <div className="w-full flex items-center justify-between " onClick={() => (data?.username ? selectAccountDelete(data.username) : null)}>
                        <span>Delete</span>
                        <Trash2 className="text-red-600" size={18} />
                    </div>
                </DropdownMenuItem>


            </DropdownMenuContent>

        </DropdownMenu>


    );
};