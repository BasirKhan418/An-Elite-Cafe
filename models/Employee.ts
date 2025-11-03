import mongoose from "mongoose";
const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    img: { type: String, required: false },
}, { timestamps: true })
export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);