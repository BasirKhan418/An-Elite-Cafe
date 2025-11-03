import { NextResponse,NextRequest } from "next/server";
import { EmployeeLoginSchema2 } from "../../../../../../validation/auth/otp";
import {  verifyOTPEntry } from "../../../../../../repository/otp/otp";
export const POST = async (request: NextRequest) => {
    try{
        const body = await request.json();
        
        const parseResult = EmployeeLoginSchema2.safeParse(body);
        if(!parseResult.success){
            return NextResponse.json({message:"Validation Error",success:false,errors:parseResult.error});
        }
        const response = await verifyOTPEntry(body.email,body.otp);
        return NextResponse.json(response);
       
    }
    catch(err){
        return NextResponse.json({message:"Internal Server Error",error:err,success:false});
    }
}