import { NextResponse, NextRequest } from "next/server";
import { AdminChangePasswordSchema } from "../../../../../../../validation/admin/admin";
import { changeAdminPassword } from "../../../../../../../repository/auth/admin";
import { requireAuth } from "../../../../../../../middleware/adminAuth";

async function handleChangePassword(request: NextRequest) {
    try {
        const body = await request.json();

        const parseResult = AdminChangePasswordSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        const { email, otp, newPassword } = body;
        const response = await changeAdminPassword(email, otp, newPassword);
        
        return NextResponse.json(response);

    } catch (err) {
        console.error("Error in change password:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

export const POST = requireAuth(handleChangePassword);
