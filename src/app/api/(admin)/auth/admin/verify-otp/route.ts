import { NextResponse, NextRequest } from "next/server";
import { AdminVerifyOTPSchema } from "../../../../../../../validation/admin/admin";
import { verifyAdminOTP } from "../../../../../../../repository/auth/admin";
import { requireAuth } from "../../../../../../../middleware/adminAuth";

async function handleVerifyOTP(request: NextRequest) {
    try {
        const body = await request.json();

        const parseResult = AdminVerifyOTPSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        const { email, otp } = body;
        const response = await verifyAdminOTP(email, otp);
        
        return NextResponse.json(response);

    } catch (err) {
        console.error("Error in verify OTP:", err);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

export const POST = requireAuth(handleVerifyOTP);
