"use server";

import { signIn } from "@/auth";
import { getUserByUsername } from "@/data/user.server";
import { LoginSchema, LoginSchemaType } from "@/schema";
import { AuthError } from "next-auth";

export const login = async function (values: LoginSchemaType) {
    const validation = LoginSchema.safeParse(values);
    if (!validation.success) {
        return {
            error: "Invalid Credentials"
        }
    }
    const { username, password } = values;
    try {
        const existingUser = await getUserByUsername(username);
        if (!existingUser) {
            return {
                error: "Invalid credentials"
            }
        }
    }
    catch {
        throw {
            error: "Something went wrong",
        };
    }
    try {
        await signIn("credentials", {
            username,
            password,
            redirectTo: '/',
        });
        return {
            success: "Logged In",
        };
    } catch (error) {
        if (error instanceof AuthError) {
            if (error instanceof AuthError && (error.name === "CredentialsSignin" || error.name === "AccessDenied")) {
                return {
                    error: "Invalid Credentials",
                };
            } else {
                console.error("Error signing in:", error.name);
                return {
                    error: "Something went wrong",
                };
            }
        }
        // note: important to rethrow like this, otherwise will not redirect
        throw error;
    }
}