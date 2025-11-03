import { NextResponse,NextRequest} from "next/server";
import jwt from "jsonwebtoken";
import { getEmployeeByEmail } from "../../../../../../repository/auth/employee";
export const GET = async (request: NextRequest) => {
    try{
 const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");
        console.log("Received Token:", token);
        if(!token){
            return NextResponse.json({message:"Token is required",success:false});
        }
        try{
         const verifytoken = jwt.verify(token,process.env.JWT_SECRET || "");
         console.log("Verified Token:", verifytoken);
         if (typeof verifytoken !== "string" && verifytoken && "email" in verifytoken) {
            const email = (verifytoken as { email?: string }).email;
            if (email) {
                const employee = await getEmployeeByEmail(email);
                return NextResponse.json(employee);
            }
         }
         return NextResponse.json({message:"Invalid Token",success:false});
        }
        catch(err){
            console.log("Token Verification Error:", err);
            return NextResponse.json({message:"Invalid Token",success:false});
        }
        
    }
    catch(err){
        return NextResponse.json({message:"Internal Server Error",error:err,success:false});
    }
}