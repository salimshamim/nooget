import { z } from "zod";

export const AccountSchema = z
    .object({
        id: z.string().optional(),
        username: z.string().min(1, { message: "User name cannot be empty" }),
        email: z.string().email().optional(),
        // Make password optional in the base schema
        password: z.string().min(6, { message: "Password must be atleast 6 characters" }).optional(),
        role: z.enum(["CUSTOMER"]),
        dbUser: z.string().min(1, { message: "Database user cannot be empty" }),
        dbPass: z.string().min(1, { message: "Database password cannot be empty" }).optional(),
        host: z.string().min(1, { message: "Host cannot be empty" }),
        dbName: z.string().min(1, { message: "Database name cannot be empty" }),
        dbPort: z
            .number()
            .int()
            .min(1, { message: "Port must be greater than 0" })
            .max(65535, { message: "Port must be less than 65536" })
            .default(3306)
            .optional(),
        cdrView: z.string().optional(),
        activityView: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // If there is no id (i.e. creation), require a non-empty password.
        if (!data.username && (!data.password || data.password.trim() === "") && (!data.dbPass || data.dbPass.trim() === "")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password field is required on account creation",
                path: ["password"],
            });
        }
        if (!data.username && (!data.dbPass || data.dbPass.trim() === "")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Database password is required on account creation",
                path: ["dbPass"],
            });
        }
    })
    .refine(
        (data) => data.cdrView !== data.activityView,
        {
            message: "cdrView and activityView cannot be the same",
            path: ["cdrView", "activityView"],
        }
    );

export type AccountSchemaType = z.infer<typeof AccountSchema>;