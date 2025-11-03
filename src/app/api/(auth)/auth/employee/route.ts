import { NextResponse, NextRequest } from "next/server";
import EmployeeSchema from "../../../../../../validation/auth/otp";
import { EmployeeLoginSchema } from "../../../../../../validation/auth/otp";
import { getEmployeeByEmail,createEmployee } from "../../../../../../repository/auth/employee";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parseResult = EmployeeSchema.safeParse(body);
        if(!parseResult.success){
            return NextResponse.json({ message: "Validation Error", success: false, errors: parseResult.error });
        }
        if(body.password!=process.env.ADMIN_PASSWORD){
            return NextResponse.json({ message: "Unauthorized: Incorrect admin password", success: false });
        }
        const response = await createEmployee(body);
        return NextResponse.json(response);
    }
    catch (err) {
        return NextResponse.json({ message: "Internal Server Error", error: err });
    }
}