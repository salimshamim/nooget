import { type DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

export type { UserRole };

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  username: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
