import { NextRequest,NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAdminToken } from "../../../../../utils/verify";
import { fetchAllTable,fetchTablesByStatus } from "../../../../../repository/tables/table";
export async function GET(request: NextRequest) {
   try{
    const headersList = await headers();
    const adminToken = headersList.get("Authorization");
    const verificationResult = verifyAdminToken(adminToken || "");
    if (!verificationResult.success) {
        return NextResponse.json({ message: verificationResult.message, success: false });
    }
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    if(!status){
        const response = await fetchAllTable();
        return NextResponse.json(response);
    }
    const response = await fetchTablesByStatus(status);
    return NextResponse.json(response);
   }
   catch(err){
    return NextResponse.json({ message: "Internal Server Error", error: err,success:false });
   }
}