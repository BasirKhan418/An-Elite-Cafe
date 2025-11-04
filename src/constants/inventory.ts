export const InventoryCategoryValues = [
  "raw_ingredients",
  "packaged_food",
  "beverages",
  "bottles",
  "utensils",
  "furniture",
  "cleaning_supplies",
  "office_supplies",
  "other",
] as const;

export type InventoryCategoryType = typeof InventoryCategoryValues[number];

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategoryType, string> = {
  raw_ingredients: "Raw Ingredients",
  packaged_food: "Packaged Food",
  beverages: "Beverages",
  bottles: "Bottles",
  utensils: "Utensils",
  furniture: "Furniture",
  cleaning_supplies: "Cleaning Supplies",
  office_supplies: "Office Supplies",
  other: "Other",
};
