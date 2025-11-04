import mongoose from "mongoose";
const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    img: { type: String, required: false },
    token: { type: String, required: false },
    empid:{ type: String, required: false,default:Date.now().toString() },
    resname:{ type: String, required: false  ,default:"An Elite Cafe" },
    joinDate:{ type: Date, required: false , default: new Date() },
    shift:{ type: String, required: false  ,default:"Morning Shift (9 AM - 5 PM)" },
    isActive: { type: Boolean, required: false, default: true },
}, { timestamps: true })
export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);