import { z } from "zod";

export const LoginSchema = z.object({
    username: z.string().min(1, { message: "User name cannot be empty" }),
    password: z.string().min(1, { message: "Password is required" }),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;