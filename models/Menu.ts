import mongoose from "mongoose";
export enum menuStatus {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
}
const MenuSchema = new mongoose.Schema({
    menuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    img: { type: String, required: false },
    icon: { type: String, required: false },
    status: { type: String, required: true, enum: Object.values(menuStatus), default: menuStatus.AVAILABLE },
    preparationTime: { type: Number, required: false  },
    isActive: { type: Boolean, required: false, default: true },
    isVegetarian: { type: Boolean, required: false, default: false },
    isSpicy: { type: Boolean, required: false, default: false },
    isGlutenFree: { type: Boolean, required: false, default: false },
}, { timestamps: true })
export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);