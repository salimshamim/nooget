"use server"

import { getAllAccountsUpdatedDesc } from "@/data/accounts.server";
import { currentUser } from "@/lib/auth";

export const fetchCustomerAccounts = async () => {
    try {
        const user = await currentUser();
        if (user?.role !== 'ADMIN') {
            return {
                error: "Unauthorized"
            }
        }
        const accounts = await getAllAccountsUpdatedDesc();
        return {
            accounts
        };
    }
    catch (error) {
        console.error("Error #getAccount actions: ", { error });
        return {
            error: "Something went wrong"
        }
    }
}
