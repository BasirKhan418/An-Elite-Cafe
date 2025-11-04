import { z } from "zod";

export enum RecipeStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft"
}

export enum RecipeType {
  MENU_ITEM = "menu_item",
  PREPARATION = "preparation",
  CLEANING = "cleaning",
  OTHER = "other"
}

export const RecipeIngredientSchema = z.object({
  item: z.string().regex(/^[a-f\d]{24}$/i, "Invalid item ObjectId"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().max(200, "Notes too long").optional(),
});

export const RecipeSchema = z.object({
  recipeid: z.string().min(1, "Recipe ID is required"),
  name: z.string().min(1, "Recipe name is required").max(100, "Recipe name too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: z.nativeEnum(RecipeType).default(RecipeType.MENU_ITEM),
  servingSize: z.number().min(1, "Serving size must be at least 1").default(1),
  preparationTime: z.number().min(0, "Preparation time must be non-negative").optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  ingredients: z.array(RecipeIngredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1, "Instruction cannot be empty")).default([]),
  tags: z.array(z.string().max(50, "Tag too long")).default([]),
  menuItem: z.string().regex(/^[a-f\d]{24}$/i, "Invalid menu item ObjectId").optional(),
  status: z.nativeEnum(RecipeStatus).default(RecipeStatus.ACTIVE),
  isActive: z.boolean().default(true),
  createdBy: z.string().min(1, "Created by is required"),
});

export const RecipeUpdateSchema = RecipeSchema.partial().extend({
  recipeid: z.string().min(1, "Recipe ID is required"),
});

export const RecipeSearchSchema = z.object({
  type: z.nativeEnum(RecipeType).optional(),
  status: z.nativeEnum(RecipeStatus).optional(),
  search: z.string().optional(),
  menuItem: z.string().regex(/^[a-f\d]{24}$/i, "Invalid menu item ObjectId").optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  createdBy: z.string().optional(),
});

export const RecipeUsageSchema = z.object({
  recipeid: z.string().min(1, "Recipe ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
  reference: z.string().max(100, "Reference too long").optional(),
  notes: z.string().max(500, "Notes too long").optional(),
  performedBy: z.string().min(1, "Performed by is required"),
});

export type RecipeData = z.infer<typeof RecipeSchema>;
export type RecipeUpdateData = z.infer<typeof RecipeUpdateSchema>;
export type RecipeSearchData = z.infer<typeof RecipeSearchSchema>;
export type RecipeIngredientData = z.infer<typeof RecipeIngredientSchema>;
export type RecipeUsageData = z.infer<typeof RecipeUsageSchema>;