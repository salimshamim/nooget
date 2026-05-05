"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const deleteCustomerAccount = async (username: string) => {
    try {
        const user = await currentUser();
        if (user?.role !== 'ADMIN') {
            return "Unauthorized"
        }
        console.log("Deleting Account ", { username: username });

        await db.user.delete({
            where: {
                username: username
            }
        });
    }
    catch (error) {
        console.error("Error: #deleteCustomerAccount ", { error, username: username })
    }
}