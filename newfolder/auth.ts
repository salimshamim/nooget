import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { getUserById } from "./data/user.server";
import type { UserRole } from "./declarations/next-auth";


export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    /*  Common scenarios signin callback is used
        - Email Verification: Allow sign-in only if the user's email is verified.
        - Account Status: Deny sign-in if the user's account is disabled.
        - Role-Based Access: Allow sign-in only for users with specific roles.
        - Multi-Factor Authentication: Check if the user has completed MFA.
        - IP Whitelisting: Allow sign-in only from specific IP addresses.
        - Time-Based Access: Allow sign-in only during specific hours.
        - Geolocation Restrictions: Allow sign-in only from specific countries.
        - Device Trust: Allow sign-in only from trusted devices.
        - Subscription Status: Allow sign-in only if the user has an active subscription.
        - Custom User Attributes: Allow sign-in based on custom user attributes.
    */
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      if (!user.id) return false;
      const existingUser = await db.user.findFirst({
        where: {
          id: user.id,
        }
      });
      if (!existingUser) {
        return false;
      }
      return true;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      token.username = existingUser.username;
      token.email = existingUser?.email;
      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (token.username && session.user) {
        session.user.username = token.username as string;
      }
      if (token.email && session.user) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
