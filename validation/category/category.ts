import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  categoryid: z.string().min(1, "Category ID is required"),
  icon: z.string().url("Icon must be a valid URL").optional(),
});


export type CategoryType = z.infer<typeof CategorySchema>;
