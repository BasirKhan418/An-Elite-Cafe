import mongoose from "mongoose";

export enum AdminRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MANAGER = "manager"
}

export enum AdminPermissions {
    MANAGE_EMPLOYEES = "manage_employees",
    MANAGE_TABLES = "manage_tables", 
    VIEW_ORDERS = "view_orders",
    MANAGE_ORDERS = "manage_orders",
    MANAGE_INVENTORY = "manage_inventory",
    VIEW_ANALYTICS = "view_analytics",
    SYSTEM_SETTINGS = "system_settings",
    MANAGE_ADMINS = "manage_admins"
}

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: Object.values(AdminRole),
        default: AdminRole.ADMIN 
    },
    permissions: [{ 
        type: String, 
        enum: Object.values(AdminPermissions),
        default: [AdminPermissions.VIEW_ORDERS, AdminPermissions.MANAGE_TABLES]
    }],
    img: { type: String, required: false },
    token: { type: String, required: false },
    adminid: { type: String, required: false, default: () => `ADMIN_${Date.now()}` },
    isActive: { type: Boolean, required: false, default: true },
    lastLogin: { type: Date, required: false },
    createdBy: { type: String, required: false },
    resname: { type: String, required: false, default: "An Elite Cafe" },
    joinDate: { type: Date, required: false, default: new Date() },
}, { timestamps: true });

AdminSchema.index({ email: 1 });
AdminSchema.index({ username: 1 });
AdminSchema.index({ role: 1 });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);