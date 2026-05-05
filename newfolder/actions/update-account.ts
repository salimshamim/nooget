"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptPassword, hashPassword } from "@/lib/encryption.server";
import { AccountSchema, AccountSchemaType } from "@/schema/AccountSchema";

export const updateCustomerAccount = async (
    values: AccountSchemaType
): Promise<{ success?: boolean; error?: string }> => {
    try {
        const user = await currentUser();
        if (user?.role !== "ADMIN") {
            return { error: "Unauthorized" };
        }

        const validation = AccountSchema.safeParse(values);
        if (!validation.success) {
            return { error: "Validation failed" };
        }
        const existingUser = await db.user.findUnique({
            where: { username: values.username },
        });
        if (!existingUser) {
            return { error: "User not found" };
        }

        // Construct our update object from the validated values.
        const updateData: Record<string, unknown> = {
            username: values.username,
            host: values.host,
            dbName: values.dbName,
            dbPort: values.dbPort,
            dbUser: values.dbUser,
            activityView: values.activityView,
            cdrView: values.cdrView,
            role: "CUSTOMER",
        };

        // Only update password if provided (non-empty)
        if (values.password && values.password.trim() !== "") {
            updateData.password = await hashPassword(values.password);
        }

        // Only update dbPass if provided (non-empty)
        if (values.dbPass && values.dbPass.trim() !== "") {
            updateData.dbPass = encryptPassword(values.dbPass);
        }


        await db.user.update({
            where: { id: existingUser.id },
            data: updateData,
        });

        return { success: true };
    } catch (err) {
        console.error("#updateCustomerAccount", { err, values });
        return { error: "Update failed" };
    }
};