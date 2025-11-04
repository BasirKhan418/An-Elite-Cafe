import { NextResponse, NextRequest } from "next/server";
import { EmployeeManagementSchema } from "../../../../../validation/admin/admin";
import { createEmployee, getEmployeeByEmail, updateEmployee, getAllEmployees, deleteEmployee, toggleEmployeeStatus } from "../../../../../repository/auth/employee";
import { requirePermission } from "../../../../../middleware/adminAuth";
import { AdminPermissions } from "../../../../../models/Admin";

async function handleGetEmployees(request: NextRequest) {
    try {
        const response = await getAllEmployees();
        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleCreateEmployee(request: NextRequest) {
    try {
        const body = await request.json();
        const parseResult = EmployeeManagementSchema.safeParse(body);
        
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        const response = await createEmployee(body);
        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleUpdateEmployee(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, originalEmail, ...updateData } = body;
        
        const employeeEmail = originalEmail || email;
        
        if (!employeeEmail) {
            return NextResponse.json({ 
                message: "Employee email is required", 
                success: false 
            });
        }

        const parseResult = EmployeeManagementSchema.partial().safeParse(updateData);
        
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        const response = await updateEmployee(employeeEmail, updateData);
        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleDeleteEmployee(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;
        
        if (!email) {
            return NextResponse.json({ 
                message: "Employee email is required", 
                success: false 
            });
        }

        const response = await deleteEmployee(email);
        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleToggleEmployeeStatus(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;
        
        if (!email) {
            return NextResponse.json({ 
                message: "Employee email is required", 
                success: false 
            });
        }

        const response = await toggleEmployeeStatus(email);
        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

export const GET = requirePermission(AdminPermissions.MANAGE_EMPLOYEES, handleGetEmployees);
export const POST = requirePermission(AdminPermissions.MANAGE_EMPLOYEES, handleCreateEmployee);
export const PUT = requirePermission(AdminPermissions.MANAGE_EMPLOYEES, handleUpdateEmployee);
export const DELETE = requirePermission(AdminPermissions.MANAGE_EMPLOYEES, handleDeleteEmployee);
export const PATCH = requirePermission(AdminPermissions.MANAGE_EMPLOYEES, handleToggleEmployeeStatus);