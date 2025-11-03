import { NextResponse, NextRequest } from "next/server";
import { EmployeeLoginSchema } from "../../../../../../validation/auth/otp";
import { getEmployeeByEmail } from "../../../../../../repository/auth/employee";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
       const headersList = await headers();
       const token = headersList.get("Authorization");
         const verificationResult = verifyAdminToken(token || "");
        if (!verificationResult.success) {
            return NextResponse.json({ message: verificationResult.message, success: false });
        }
        if (!email) {
            return NextResponse.json({ message: "Email is required", success: false });
        }
        const parseResult = EmployeeLoginSchema.safeParse({ email });
        if (!parseResult.success) {
            return NextResponse.json({ message: "Validation Error", success: false, errors: parseResult.error });
        }
        // Fetch employee by email logic here
        const response = await getEmployeeByEmail(email);  
        return NextResponse.json(response);
    }
    catch (err) {
        return NextResponse.json({ message: "Internal Server Error", error: err });
    }
}