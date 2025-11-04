import { NextResponse, NextRequest } from "next/server";
import { AdminSendOTPSchema } from "../../../../../../../validation/admin/admin";
import { sendAdminOTP } from "../../../../../../../repository/auth/admin";
import { requireAuth } from "../../../../../../../middleware/adminAuth";

async function handleSendOTP(request: NextRequest) {
    try {
        const body = await request.json();

        const parseResult = AdminSendOTPSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        const { email, currentPassword } = body;
        const response = await sendAdminOTP(email, currentPassword);
        
        return NextResponse.json(response);

    } catch (err) {
        console.error("Error in send OTP:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

export const POST = requireAuth(handleSendOTP);
