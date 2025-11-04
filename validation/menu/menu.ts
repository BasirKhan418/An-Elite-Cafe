import { z } from "zod";

export enum MenuStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
}

export const MenuSchema = z.object({
  menuid: z.string().min(1, "Menu ID is required"),
  name: z.string().min(1, "Menu name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ObjectId").optional(),
  img: z.string().url("Invalid image URL").optional(),
  icon: z.string().url("Invalid icon URL").optional(),
  status: z.nativeEnum(MenuStatus).default(MenuStatus.AVAILABLE),
  preparationTime: z.number().min(0, "Preparation time must be non-negative").optional(),
  isActive: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
});

export type MenuType = z.infer<typeof MenuSchema>;
