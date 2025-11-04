import { z } from "zod";
import { AdminRole, AdminPermissions } from "../../models/Admin";

export const AdminLoginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const AdminRegistrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
               "Password must contain at least one uppercase letter, lowercase letter, number, and special character"),
    role: z.enum([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER]),
    permissions: z.array(z.enum([
        AdminPermissions.MANAGE_EMPLOYEES,
        AdminPermissions.MANAGE_TABLES,
        AdminPermissions.VIEW_ORDERS,
        AdminPermissions.MANAGE_ORDERS,
        AdminPermissions.MANAGE_INVENTORY,
        AdminPermissions.VIEW_ANALYTICS,
        AdminPermissions.SYSTEM_SETTINGS,
        AdminPermissions.MANAGE_ADMINS
    ])).optional(),
    img: z.string().url().optional()
});

export const AdminUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    username: z.string().min(3, "Username must be at least 3 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
               "Password must contain at least one uppercase letter, lowercase letter, number, and special character")
        .optional(),
    role: z.enum([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER]).optional(),
    permissions: z.array(z.enum([
        AdminPermissions.MANAGE_EMPLOYEES,
        AdminPermissions.MANAGE_TABLES,
        AdminPermissions.VIEW_ORDERS,
        AdminPermissions.MANAGE_ORDERS,
        AdminPermissions.MANAGE_INVENTORY,
        AdminPermissions.VIEW_ANALYTICS,
        AdminPermissions.SYSTEM_SETTINGS
    ])).optional(),
    img: z.string().url().optional(),
    isActive: z.boolean().optional()
});

export const EmployeeManagementSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().min(3, "Username must be at least 3 characters").optional()
    ),
    email: z.string().email("Invalid email format"),
    role: z.string().min(2, "Role must be specified"),
    img: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.string().url("Invalid image URL").optional()
    ),
    shift: z.string().optional()
});

export const TableManagementSchema = z.object({
    tableid: z.string().min(1, "Table ID is required"),
    name: z.string().min(1, "Table name is required"),
    capacity: z.number().min(1, "Capacity must be at least 1").max(20, "Capacity cannot exceed 20"),
    status: z.enum(["available", "occupied", "reserved"]).optional()
});

export type AdminLoginData = z.infer<typeof AdminLoginSchema>;
export type AdminRegistrationData = z.infer<typeof AdminRegistrationSchema>;
export type AdminUpdateData = z.infer<typeof AdminUpdateSchema>;
export type EmployeeManagementData = z.infer<typeof EmployeeManagementSchema>;
export type TableManagementData = z.infer<typeof TableManagementSchema>;