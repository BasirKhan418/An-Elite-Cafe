import { NextResponse, NextRequest } from "next/server";
import { TableManagementSchema } from "../../../../../../validation/admin/admin";
import { requirePermission } from "../../../../../../middleware/adminAuth";
import { AdminPermissions } from "../../../../../../models/Admin";
import ConnectDb from "../../../../../../middleware/connectdb";
import Table from "../../../../../../models/Table";

async function handleGetTables(request: NextRequest) {
    try {
        await ConnectDb();
        const tables = await Table.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ 
            message: "Tables fetched successfully", 
            success: true, 
            data: tables 
        });
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleCreateTable(request: NextRequest) {
    try {
        const body = await request.json();
        const parseResult = TableManagementSchema.safeParse(body);
        
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        await ConnectDb();
        const table = await Table.create(body);
        
        return NextResponse.json({ 
            message: "Table created successfully", 
            success: true, 
            data: table 
        });
    } catch (err: any) {
        if (err.code === 11000) {
            return NextResponse.json({ 
                message: "Table with this ID already exists", 
                success: false 
            });
        }
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleUpdateTable(request: NextRequest) {
    try {
        const body = await request.json();
        const { tableid, ...updateData } = body;
        
        if (!tableid) {
            return NextResponse.json({ 
                message: "Table ID is required", 
                success: false 
            });
        }

        const parseResult = TableManagementSchema.partial().safeParse(updateData);
        
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        await ConnectDb();
        const table = await Table.findOneAndUpdate(
            { tableid }, 
            updateData, 
            { new: true }
        );
        
        if (!table) {
            return NextResponse.json({ 
                message: "Table not found", 
                success: false 
            });
        }
        
        return NextResponse.json({ 
            message: "Table updated successfully", 
            success: true, 
            data: table 
        });
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleDeleteTable(request: NextRequest) {
    try {
        const body = await request.json();
        const { tableid } = body;
        
        if (!tableid) {
            return NextResponse.json({ 
                message: "Table ID is required", 
                success: false 
            });
        }

        await ConnectDb();
        const table = await Table.findOneAndDelete({ tableid });
        
        if (!table) {
            return NextResponse.json({ 
                message: "Table not found", 
                success: false 
            });
        }
        
        return NextResponse.json({ 
            message: "Table deleted successfully", 
            success: true, 
            data: table 
        });
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

export const GET = requirePermission(AdminPermissions.MANAGE_TABLES, handleGetTables);
export const POST = requirePermission(AdminPermissions.MANAGE_TABLES, handleCreateTable);
export const PUT = requirePermission(AdminPermissions.MANAGE_TABLES, handleUpdateTable);
export const DELETE = requirePermission(AdminPermissions.MANAGE_TABLES, handleDeleteTable);