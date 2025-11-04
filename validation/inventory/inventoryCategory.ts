import { z } from "zod";

export enum InventoryCategoryType {
  RAW_INGREDIENTS = "raw_ingredients",
  PACKAGED_FOOD = "packaged_food",
  BEVERAGES = "beverages",
  BOTTLES = "bottles",
  UTENSILS = "utensils",
  FURNITURE = "furniture",
  CLEANING_SUPPLIES = "cleaning_supplies",
  OFFICE_SUPPLIES = "office_supplies",
  OTHER = "other"
}

export const InventoryCategorySchema = z.object({
  categoryid: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Category name is required").max(100, "Category name too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: z.nativeEnum(InventoryCategoryType).default(InventoryCategoryType.OTHER),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  minimumStockLevel: z.number().min(0, "Minimum stock level must be non-negative").default(0),
});

export const InventoryCategoryUpdateSchema = InventoryCategorySchema.partial().extend({
  categoryid: z.string().min(1, "Category ID is required"),
});

export type InventoryCategoryData = z.infer<typeof InventoryCategorySchema>;
export type InventoryCategoryUpdateData = z.infer<typeof InventoryCategoryUpdateSchema>;