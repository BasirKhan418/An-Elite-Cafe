import mongoose from "mongoose";

export enum OrderStatus {
    PENDING = "pending",
    PREPARING = "preparing", 
    READY = "ready",
    SERVED = "served",
    CANCELLED = "cancelled",
    DONE = "done"
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    PARTIALLY_PAID = "partially_paid",
    REFUNDED = "refunded"
}

const OrderItemSchema = new mongoose.Schema({
    menuid: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Menu' },
    notes: { type: String, required: false },
    quantity: { type: Number, required: true, default: 1, min: 1 }, 
});

const OrderSchema = new mongoose.Schema({
    orderid: { type: String, required: true, unique: true, default: () => `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
    tableid: { type: String, required: true, ref: 'Table' },
    tableNumber: { type: String, required: true },
    customerName: { type: String, required: false },
    customerPhone: { type: String, required: false },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    sgst: { type: Number, required: true, default: 2.5, min: 0, max: 20 },
    cgst: { type: Number, required: true, default: 2.5, min: 0, max: 20 },
    discount: { type: Number, required: false, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        required: true, 
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING 
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    paymentMethod: { type: String, required: false },
    employeeId: { type: String, required: false, ref: 'Employee' },
    employeeName: { type: String, required: false },
    orderDate: { type: Date, required: true, default: new Date() },
    completedAt: { type: Date, required: false },
    isgeneratedBill: { type: Boolean, required: false, default: false },
}, { timestamps: true });

OrderSchema.index({ tableid: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ paymentStatus: 1 });

export default mongoose.models?.Order || mongoose.model('Order', OrderSchema);