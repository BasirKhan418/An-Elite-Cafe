import { NextResponse, NextRequest } from "next/server";
import { AdminLoginSchema } from "../../../../../../validation/admin/admin";
import { loginAdmin } from "../../../../../../repository/auth/admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const parseResult = AdminLoginSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ 
                message: "Validation Error", 
                success: false, 
                errors: parseResult.error.issues 
            });
        }

        const response = await loginAdmin(body);
        return NextResponse.json(response);

    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}