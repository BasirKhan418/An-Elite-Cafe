import mongoose from "mongoose";

export enum StockTransactionType {
  PURCHASE = "purchase",
  USAGE = "usage",
  WASTE = "waste",
  ADJUSTMENT = "adjustment",
  RETURN = "return",
  TRANSFER = "transfer"
}

export enum StockTransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

const StockTransactionSchema = new mongoose.Schema(
  {
    transactionid: { type: String, required: true, unique: true },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(StockTransactionType),
    },
    quantity: { type: Number, required: true }, 
    unitCost: { type: Number, required: true, default: 0, min: 0 }, 
    totalCost: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      required: true,
      enum: Object.values(StockTransactionStatus),
      default: StockTransactionStatus.COMPLETED,
    },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    reference: { type: String, required: false },
    notes: { type: String, required: false },
    expiryDate: { type: Date, required: false },
    batchNumber: { type: String, required: false },
    performedBy: { type: String, required: true }, 
    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockTransaction",
      required: false,
    },
  },
  { timestamps: true }
);

StockTransactionSchema.index({ item: 1, createdAt: -1 });
StockTransactionSchema.index({ type: 1, createdAt: -1 });
StockTransactionSchema.index({ transactionid: 1 });
StockTransactionSchema.index({ reference: 1 });
StockTransactionSchema.index({ performedBy: 1 });

StockTransactionSchema.pre('save', function(next) {
  this.totalCost = Math.abs(this.quantity) * this.unitCost;
  next();
});

export default mongoose.models?.StockTransaction || mongoose.model("StockTransaction", StockTransactionSchema);