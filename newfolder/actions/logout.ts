"use server";

import { signOut } from "@/auth";
import { cookies } from "next/headers";

export default async function logout() {
  console.log("Signing out...");
  (await cookies()).set("next-auth.session-token", "", { maxAge: -1 }); // Clear session cookie
  await signOut({ redirectTo: "/auth/login" });
}