import mongoose from "mongoose";
const CouponSchema = new mongoose.Schema({
    name: { type: String, required: true},
    couponcode: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true , min:0 , max:100 },
    description: { type: String, required: false  },
    totalUsageLimit: { type: Number, required: false , default: null },
}, { timestamps: true })
export default mongoose.models?.Coupon || mongoose.model('Coupon', CouponSchema);