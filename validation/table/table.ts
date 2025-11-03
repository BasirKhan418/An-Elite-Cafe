import { z } from "zod";

export const TableStatusEnum = z.enum(["available", "occupied", "reserved"]);

export const TableZodSchema = z.object({
  tableid: z.string().min(1, "Table ID is required"),
  name: z.string().min(1, "Table name is required"),
  capacity: z
    .number()
    .int()
    .positive("Capacity must be a positive number")
    .min(1, "Table must seat at least 1 person"),
  status: TableStatusEnum.optional().default("available"),
});
