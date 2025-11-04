import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { AdminRole, AdminPermissions } from "../models/Admin";

export interface AdminAuthPayload {
    adminId: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermissions[];
}

export const verifyAdminToken = (token: string): AdminAuthPayload | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminAuthPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

export const extractAdminFromRequest = (request: NextRequest): AdminAuthPayload | null => {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.substring(7);
        return verifyAdminToken(token);
    } catch (error) {
        return null;
    }
};

export const hasPermission = (admin: AdminAuthPayload, requiredPermission: AdminPermissions): boolean => {
    if (admin.role === AdminRole.SUPER_ADMIN) {
        return true;
    }
    
    return admin.permissions.includes(requiredPermission);
};

export const hasRole = (admin: AdminAuthPayload, requiredRole: AdminRole): boolean => {
    const roleHierarchy = {
        [AdminRole.SUPER_ADMIN]: 3,
        [AdminRole.ADMIN]: 2,
        [AdminRole.MANAGER]: 1
    };

    return roleHierarchy[admin.role] >= roleHierarchy[requiredRole];
};

export const requireAuth = (handler: (request: NextRequest, admin: AdminAuthPayload) => Promise<Response>) => {
    return async (request: NextRequest) => {
        const admin = extractAdminFromRequest(request);
        
        if (!admin) {
            return new Response(
                JSON.stringify({ message: "Unauthorized: Invalid token", success: false }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        return handler(request, admin);
    };
};

export const requirePermission = (
    requiredPermission: AdminPermissions,
    handler: (request: NextRequest, admin: AdminAuthPayload) => Promise<Response>
) => {
    return requireAuth(async (request: NextRequest, admin: AdminAuthPayload) => {
        if (!hasPermission(admin, requiredPermission)) {
            return new Response(
                JSON.stringify({ 
                    message: `Forbidden: ${requiredPermission} permission required`, 
                    success: false 
                }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        return handler(request, admin);
    });
};

export const requireRole = (
    requiredRole: AdminRole,
    handler: (request: NextRequest, admin: AdminAuthPayload) => Promise<Response>
) => {
    return requireAuth(async (request: NextRequest, admin: AdminAuthPayload) => {
        if (!hasRole(admin, requiredRole)) {
            return new Response(
                JSON.stringify({ 
                    message: `Forbidden: ${requiredRole} role or higher required`, 
                    success: false 
                }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        return handler(request, admin);
    });
};