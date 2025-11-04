import mongoose from "mongoose";
export enum TableStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    RESERVED = "reserved"
}
const TableSchema = new mongoose.Schema({
tableid: { type: String, required: true ,unique:true  },
name: { type: String, required: true  },
capacity: { type: Number, required: true  },
status: { type: String, required: true  ,default:TableStatus.AVAILABLE },
}, { timestamps: true })
export default mongoose.models?.Table || mongoose.model('Table', TableSchema);