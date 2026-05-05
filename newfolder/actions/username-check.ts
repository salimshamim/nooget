"use server";

import { getUserByUsername } from "@/data/user.server";
import { currentUser } from "@/lib/auth";

export const checkValidUsername = async (username: string) => {
    try {
        const user = await currentUser();
        if (user?.role !== 'ADMIN') {
            return {
                error: "Unauthorized"
            }
        }
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            console.log("User exists: ", username);
            return {
                valid: false,
                error: "Username already exists"
            }
        }
        return {
            valid: true
        }
    }
    catch (error) {
        console.error("Error checking username: ", { error });
        return {
            error: "Cannot check username"
        }
    }
}