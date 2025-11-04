import { z } from "zod";
import { InventoryCategoryValues } from "../../src/constants/inventory";

export enum InventoryItemUnit {
  KILOGRAMS = "kg",
  GRAMS = "g",
  LITERS = "l",
  MILLILITERS = "ml",
  PIECES = "pcs",
  PACKETS = "packets",
  BOTTLES = "bottles",
  BOXES = "boxes",
  CANS = "cans",
  UNITS = "units"
}

export enum InventoryItemStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued"
}

export const InventoryItemSchema = z.object({
  itemid: z.string().min(1, "Item ID is required"),
  name: z.string().min(1, "Item name is required").max(100, "Item name too long"),
  description: z.string().max(500, "Description too long").optional(),
  category: z.enum(InventoryCategoryValues),
  unit: z.nativeEnum(InventoryItemUnit).default(InventoryItemUnit.UNITS),
  currentStock: z.coerce.number().min(0, "Current stock must be non-negative").default(0),
  minimumStock: z.coerce.number().min(0, "Minimum stock must be non-negative").default(0),
  maximumStock: z.coerce.number().min(0, "Maximum stock must be non-negative").optional(),
  averageCostPerUnit: z.coerce.number().min(0, "Average cost per unit must be non-negative").default(0),
  totalValue: z.coerce.number().min(0, "Total value must be non-negative").default(0),
  status: z.nativeEnum(InventoryItemStatus).default(InventoryItemStatus.ACTIVE),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  isPerishable: z.boolean().default(false),
  shelfLifeDays: z.coerce.number().min(0, "Shelf life days must be non-negative").optional(),
  storageLocation: z.string().max(100, "Storage location too long").optional(),
  tags: z.array(z.string().max(50, "Tag too long")).default([]),
  isActive: z.boolean().default(true),
});

export const InventoryItemUpdateSchema = InventoryItemSchema.partial().extend({
  itemid: z.string().min(1, "Item ID is required"),
});

export const InventoryItemSearchSchema = z.object({
  category: z.enum(InventoryCategoryValues).optional(),
  status: z.nativeEnum(InventoryItemStatus).optional(),
  search: z.string().optional(),
  lowStock: z.boolean().optional(), // Filter items below minimum stock
  isPerishable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export type InventoryItemData = z.infer<typeof InventoryItemSchema>;
export type InventoryItemUpdateData = z.infer<typeof InventoryItemUpdateSchema>;
export type InventoryItemSearchData = z.infer<typeof InventoryItemSearchSchema>;