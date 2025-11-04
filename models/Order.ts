import mongoose from "mongoose";

export enum OrderStatus {
    PENDING = "pending",
    PREPARING = "preparing", 
    READY = "ready",
    SERVED = "served",
    CANCELLED = "cancelled"
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    PARTIALLY_PAID = "partially_paid",
    REFUNDED = "refunded"
}

const OrderItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    category: { type: String, required: false },
    notes: { type: String, required: false }
});

const OrderSchema = new mongoose.Schema({
    orderid: { type: String, required: true, unique: true, default: () => `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
    tableid: { type: String, required: true, ref: 'Table' },
    tableNumber: { type: String, required: true },
    customerName: { type: String, required: false },
    customerPhone: { type: String, required: false },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: false, default: 0 },
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
    estimatedTime: { type: Number, required: false }, 
    completedAt: { type: Date, required: false },
    notes: { type: String, required: false }
}, { timestamps: true });

OrderSchema.index({ tableid: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);