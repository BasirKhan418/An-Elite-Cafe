import { NextResponse, NextRequest } from "next/server";
import { 
    getAllAdminsForSuperAdmin, 
    createAdminBySuperAdmin, 
    updateAdminBySuperAdmin, 
    deleteAdminBySuperAdmin 
} from "../../../../../repository/auth/admin";
import { 
    CreateAdminBySuperAdminSchema, 
    UpdateAdminBySuperAdminSchema 
} from "../../../../../validation/admin/admin";
import { verifyAdminAuth } from "../../../../../middleware/adminAuth";

// GET all admins (Super Admin only)
export async function GET(request: NextRequest) {
    try {
        // Verify authentication and role
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ 
                message: authResult.message, 
                success: false 
            }, { status: 401 });
        }

        // Check if user is super admin (case-insensitive)
        if (authResult.admin.role?.toLowerCase() !== "super_admin") {
            return NextResponse.json({ 
                message: "Unauthorized. Only super admins can access this resource.", 
                success: false 
            }, { status: 403 });
        }

        const response = await getAllAdminsForSuperAdmin();
        return NextResponse.json(response);

    } catch (err) {
        console.error("Error in GET /api/admins:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        }, { status: 500 });
    }
}

// POST create new admin (Super Admin only)
export async function POST(request: NextRequest) {
    try {
        // Verify authentication and role
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ 
                message: authResult.message, 
                success: false 
            }, { status: 401 });
        }

        // Check if user is super admin (case-insensitive)
        if (authResult.admin.role?.toLowerCase() !== "super_admin") {
            return NextResponse.json({ 
                message: "Unauthorized. Only super admins can create admins.", 
                success: false 
            }, { status: 403 });
        }

        const body = await request.json();

        // Validate request body
        const parseResult = CreateAdminBySuperAdminSchema.safeParse(body);
        if (!parseResult.success) {
            console.error("Validation errors:", parseResult.error.issues);
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            }, { status: 400 });
        }

        const response = await createAdminBySuperAdmin(
            parseResult.data, 
            authResult.admin.adminid || authResult.admin._id
        );
        
        return NextResponse.json(response, { 
            status: response.success ? 201 : 400 
        });

    } catch (err) {
        console.error("Error in POST /api/admins:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        }, { status: 500 });
    }
}

// PUT update admin (Super Admin only)
export async function PUT(request: NextRequest) {
    try {
        // Verify authentication and role
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ 
                message: authResult.message, 
                success: false 
            }, { status: 401 });
        }

        // Check if user is super admin (case-insensitive)
        if (authResult.admin.role?.toLowerCase() !== "super_admin") {
            return NextResponse.json({ 
                message: "Unauthorized. Only super admins can update admins.", 
                success: false 
            }, { status: 403 });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ 
                message: "Admin ID is required", 
                success: false 
            }, { status: 400 });
        }

        // Validate request body
        const parseResult = UpdateAdminBySuperAdminSchema.safeParse(updateData);
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            }, { status: 400 });
        }

        const response = await updateAdminBySuperAdmin(id, parseResult.data);
        return NextResponse.json(response, { 
            status: response.success ? 200 : 400 
        });

    } catch (err) {
        console.error("Error in PUT /api/admins:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        }, { status: 500 });
    }
}

// DELETE admin (Super Admin only)
export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication and role
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ 
                message: authResult.message, 
                success: false 
            }, { status: 401 });
        }

        // Check if user is super admin (case-insensitive)
        if (authResult.admin.role?.toLowerCase() !== "super_admin") {
            return NextResponse.json({ 
                message: "Unauthorized. Only super admins can delete admins.", 
                success: false 
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ 
                message: "Admin ID is required", 
                success: false 
            }, { status: 400 });
        }

        const response = await deleteAdminBySuperAdmin(id);
        return NextResponse.json(response, { 
            status: response.success ? 200 : 400 
        });

    } catch (err) {
        console.error("Error in DELETE /api/admins:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        }, { status: 500 });
    }
}
