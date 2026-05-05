"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AccountForm } from "./account-form";
import { PulseLoader } from 'react-spinners';

import { ReactNode, useState } from "react";
import { AccountSchemaType } from "@/schema/AccountSchema";

export function AccountFormDialogue({ children, data }: { children: ReactNode, data?: AccountSchemaType }) {
    const [pending, setPending] = useState(false);
    const formId = "create-insight-form";
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{!data ? "New Account" : "Edit account"}</DialogTitle>
                    <DialogDescription>
                        {!data
                            ? "Create a new customer account"
                            : "Edit Customer Account"}
                    </DialogDescription>
                </DialogHeader>
                <AccountForm formId={formId} setPending={setPending} pending={pending} exisingData={data} />
                <DialogFooter className="flex w-full justify-end">
                    <Button className='cursor-pointer' disabled={pending} type="submit" form={formId}>
                        {pending ?
                            <PulseLoader color="#FFFFFF" speedMultiplier={0.7} /> :
                            <span>{!data ? 'Create' : 'Update'}</span>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}