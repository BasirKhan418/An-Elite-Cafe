import mongoose from "mongoose";
import { InventoryCategoryValues } from "../src/constants/inventory";

const InventoryCategorySchema = new mongoose.Schema(
  {
    categoryid: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    description: { type: String, required: false },
    type: {
      type: String,
      required: true,
      enum: InventoryCategoryValues,
      default: "other",
    },
    icon: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    minimumStockLevel: { type: Number, default: 0, min: 0 }, 
  },
  { timestamps: true }
);

InventoryCategorySchema.index({ name: 1, type: 1 });

export default mongoose.models?.InventoryCategory || mongoose.model("InventoryCategory", InventoryCategorySchema);