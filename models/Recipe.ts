import mongoose from "mongoose";

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

interface RecipeIngredient {
  item: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  notes?: string;
}

const RecipeIngredientSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    notes: { type: String, required: false },
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema(
  {
    recipeid: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    description: { type: String, required: false },
    type: {
      type: String,
      required: true,
      enum: Object.values(RecipeType),
      default: RecipeType.MENU_ITEM,
    },
    servingSize: { type: Number, required: true, default: 1, min: 1 }, 
    estimatedCost: { type: Number, required: true, default: 0, min: 0 }, 
    costPerServing: { type: Number, required: true, default: 0, min: 0 }, 
    preparationTime: { type: Number, required: false, min: 0 }, 
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    ingredients: [RecipeIngredientSchema],
    instructions: [{ type: String }], 
    tags: [{ type: String }], 
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: false,
    }, // Link to menu item if applicable
    status: {
      type: String,
      required: true,
      enum: Object.values(RecipeStatus),
      default: RecipeStatus.ACTIVE,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    lastUsed: { type: Date, required: false },
    usageCount: { type: Number, default: 0, min: 0 }, 
  },
  { timestamps: true }
);

RecipeSchema.index({ name: 1, type: 1 });
RecipeSchema.index({ recipeid: 1 });
RecipeSchema.index({ menuItem: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ status: 1 });

RecipeSchema.pre('save', async function(next) {
  if (this.isModified('ingredients') || this.isModified('servingSize')) {
    await this.populate('ingredients.item');
    
    let totalCost = 0;
    for (const ingredient of this.ingredients) {
      if (ingredient.item && typeof ingredient.item === 'object' && 'averageCostPerUnit' in ingredient.item) {
        totalCost += ingredient.quantity * (ingredient.item as any).averageCostPerUnit;
      }
    }
    
    this.estimatedCost = totalCost;
    this.costPerServing = this.servingSize > 0 ? totalCost / this.servingSize : 0;
  }
  next();
});

export default mongoose.models?.Recipe || mongoose.model("Recipe", RecipeSchema);