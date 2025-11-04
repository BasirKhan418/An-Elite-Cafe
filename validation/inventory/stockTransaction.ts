import { z } from "zod";

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

export const StockTransactionSchema = z.object({
  transactionid: z.string().min(1, "Transaction ID is required"),
  item: z.string().regex(/^[a-f\d]{24}$/i, "Invalid item ObjectId"),
  type: z.nativeEnum(StockTransactionType),
  quantity: z.number().refine((val) => val !== 0, "Quantity cannot be zero"),
  unitCost: z.number().min(0, "Unit cost must be non-negative").default(0),
  status: z.nativeEnum(StockTransactionStatus).default(StockTransactionStatus.COMPLETED),
  reference: z.string().max(100, "Reference too long").optional(),
  notes: z.string().max(500, "Notes too long").optional(),
  expiryDate: z.string().datetime().optional(), // ISO date string
  batchNumber: z.string().max(50, "Batch number too long").optional(),
  performedBy: z.string().min(1, "Performed by is required"),
  relatedTransaction: z.string().regex(/^[a-f\d]{24}$/i, "Invalid related transaction ObjectId").optional(),
});

export const StockTransactionUpdateSchema = StockTransactionSchema.partial().extend({
  transactionid: z.string().min(1, "Transaction ID is required"),
});

export const StockTransactionSearchSchema = z.object({
  itemid: z.string().regex(/^[a-f\d]{24}$/i, "Invalid item ObjectId").optional(),
  type: z.nativeEnum(StockTransactionType).optional(),
  status: z.nativeEnum(StockTransactionStatus).optional(),
  performedBy: z.string().optional(),
  reference: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const BulkStockUpdateSchema = z.object({
  transactions: z.array(StockTransactionSchema).min(1, "At least one transaction is required"),
});

export type StockTransactionData = z.infer<typeof StockTransactionSchema>;
export type StockTransactionUpdateData = z.infer<typeof StockTransactionUpdateSchema>;
export type StockTransactionSearchData = z.infer<typeof StockTransactionSearchSchema>;
export type BulkStockUpdateData = z.infer<typeof BulkStockUpdateSchema>;