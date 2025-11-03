import { NextResponse,NextRequest } from "next/server";
import { createOTPEntry } from "../../../../../../repository/otp/otp";
import { EmployeeLoginSchema } from "../../../../../../validation/auth/otp";
export const POST = async (request: NextRequest) => {
    try{
        const body = await request.json();
        
        const parseResult = EmployeeLoginSchema.safeParse(body);
        if(!parseResult.success){
            return NextResponse.json({message:"Validation Error",success:false,errors:parseResult.error});
        }
        const response = await createOTPEntry(body.email);
        return NextResponse.json(response);
    }
    catch(err){
        return NextResponse.json({message:"Internal Server Error",error:err,success:false});
    }
}