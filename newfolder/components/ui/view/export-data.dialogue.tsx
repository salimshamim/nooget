"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PulseLoader } from 'react-spinners';

import { ReactNode, useState } from "react";
import { ExportDataForm } from "../export-data-form";

export function ExportDataDialogue({ children, username }: { children: ReactNode, username: string }) {
    const [pending, setPending] = useState(false);
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] flex flex-col items-center justify-center px-5">
                <DialogHeader>
                    <DialogTitle>Export Data</DialogTitle>
                </DialogHeader>
                <ExportDataForm formId="export-form" username={username} pending={pending} setPending={setPending} />
                <DialogFooter className="flex w-full justify-end">
                    <Button className='cursor-pointer' disabled={pending} type="submit" form="export-form" >
                        {pending ?
                            <PulseLoader color="#FFFFFF" speedMultiplier={0.7} /> :
                            <span>Download</span>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}