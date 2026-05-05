import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { LoginSchema } from "./schema";
import { getUserByUsername } from "./data/user.server";
import { comparePasswords } from "./lib/encryption.server";
import { NextAuthConfig } from "next-auth";
//for new build

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { username, password } = validatedFields.data;
          const user = await getUserByUsername(username);
          if (!user || !user.password) {
            return null;
          } else {
            const passwordMatch = await comparePasswords(password, user.password);
            if (passwordMatch) {
              return user;
            }
          }
        }
        return null;
      },
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
