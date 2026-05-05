"use server";

import { currentUser } from "@/lib/auth";
import { AccountSchema, AccountSchemaType } from "@/schema/AccountSchema";
import { db } from "@/lib/db";
import { encryptPassword, hashPassword } from "@/lib/encryption.server";
import { getUserByUsername } from "@/data/user.server";


export const createCustomerAccount = async (values: AccountSchemaType) => {
    try {
        const user = await currentUser();
        if (user?.role !== 'ADMIN') {
            return {
                error: "Unauthorized"
            }
        }
        const validatedValues = AccountSchema.safeParse(values);
        if (!validatedValues.success) {
            return {
                error: "Invalid Account Values"
            }
        }
        const { username, password, host, dbName, dbPort, dbUser, dbPass, activityView, cdrView } = validatedValues.data;
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return {
                error: "Username already exists"
            }
        }
        if (!password || !dbPass) {
            return {
                error: "Must Provide password while account creation"
            }
        }
        const hashedPassword = await hashPassword(password);
        const encryptedDBPassword = encryptPassword(dbPass);
        await db.user.create({
            data: {
                username,
                password: hashedPassword,
                host,
                dbName,
                dbPort,
                dbUser,
                dbPass: encryptedDBPassword,
                activityView,
                cdrView,
                role: 'CUSTOMER'
            }
        })

        return {
            success: "Created Account"
        }
    }
    catch (error) {
        console.error("Error #createAccount ", { error, values });
    }
}