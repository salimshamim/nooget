import { z } from "zod";
import { subDays, isBefore } from "date-fns";

export const ExportDataSchema = z.object({
    dataType: z
        .array(z.enum(["cdr", "activity_data"]))
        .nonempty()
        .default(["cdr"]),
    startDate: z
        .string()
        .datetime()
        .default(() => subDays(new Date(), 7).toISOString()),
    endDate: z
        .string()
        .datetime()
        .default(() => new Date().toISOString()),
}).refine(
    ({ startDate, endDate }) => isBefore(new Date(startDate), new Date(endDate)),
    {
        message: "startDate must be before endDate",
        path: ["startDate", "endDate"],
    }
);
export type TypeExportDataSchema = z.infer<typeof ExportDataSchema>;