"use server";

import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id: id,
      }
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  console.log("Getting user by email:", email);

  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });
    console.log("Returning User: ", user?.email);
    return user;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  console.log("Getting user by username:", username);
  try {
    const user = await db.user.findUnique({
      where: {
        username: username,
      },
    });
    console.log("Returning User: ", user?.email);
    return user;
  } catch (error) {
    console.error("#getUserByUsername ", { error })
    return null;
  }
};

