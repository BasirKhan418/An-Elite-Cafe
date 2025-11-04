import mongoose from "mongoose";

export enum menuStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
}

const MenuSchema = new mongoose.Schema(
  {
    menuid: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true }, 
    description: { type: String, required: false },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    img: { type: String, required: false },
    icon: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: Object.values(menuStatus),
      default: menuStatus.AVAILABLE,
    },
    preparationTime: { type: Number, required: false },
    isActive: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MenuSchema.index({ name: 1, category: 1 });

export default mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
