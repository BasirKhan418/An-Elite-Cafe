import mongoose from "mongoose";
import { InventoryCategoryValues } from "../src/constants/inventory";

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

const InventoryItemSchema = new mongoose.Schema(
  {
    itemid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    category: {
      type: String,
      required: true,
      enum: InventoryCategoryValues,
      default: "other",
    },
    unit: {
      type: String,
      required: true,
      enum: Object.values(InventoryItemUnit),
      default: InventoryItemUnit.UNITS,
    },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    minimumStock: { type: Number, required: true, default: 0, min: 0 },
    maximumStock: { type: Number, required: false, min: 0 },
    averageCostPerUnit: { type: Number, required: true, default: 0, min: 0 }, 
    totalValue: { type: Number, required: true, default: 0, min: 0 }, 
    status: {
      type: String,
      required: true,
      enum: Object.values(InventoryItemStatus),
      default: InventoryItemStatus.ACTIVE,
    },
    barcode: { type: String, required: false },
    sku: { type: String, required: false },
    isPerishable: { type: Boolean, default: false },
    shelfLifeDays: { type: Number, required: false, min: 0 }, 
    storageLocation: { type: String, required: false },
    tags: [{ type: String }], 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ name: 1, category: 1 });
InventoryItemSchema.index({ currentStock: 1 });
InventoryItemSchema.index({ tags: 1 });

InventoryItemSchema.pre('save', function(next) {
  this.totalValue = this.currentStock * this.averageCostPerUnit;
  next();
});

if (mongoose.models.InventoryItem) {
  delete mongoose.models.InventoryItem;
}

export default mongoose.model("InventoryItem", InventoryItemSchema);