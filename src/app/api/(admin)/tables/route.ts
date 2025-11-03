import { NextRequest,NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAdminToken } from "../../../../../utils/verify";
import { fetchAllTable,fetchTablesByStatus } from "../../../../../repository/tables/table";
import { createTable } from "../../../../../repository/tables/tablecrud";
import { TableZodSchema } from "../../../../../validation/table/table";
import { TableStatusEnum } from "../../../../../validation/table/table";
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
        const result = TableStatusEnum.safeParse(status);
        if(!result.success){
            return NextResponse.json({ message: "Validation Error", success: false, errors: result.error });
        }
    const response = await fetchTablesByStatus(status);
    return NextResponse.json(response);
   }
   catch(err){
    return NextResponse.json({ message: "Internal Server Error", error: err,success:false });
   }
}

export async function POST(request: NextRequest) {
    try{
        const headersList = await headers();
        const adminToken = headersList.get("Authorization");
        const verificationResult = verifyAdminToken(adminToken || "");
        if (!verificationResult.success) {
            return NextResponse.json({ message: verificationResult.message, success: false });
        }
        const data = await request.json();
        const parseResult = TableZodSchema.safeParse(data);
        if (!parseResult.success) {
            return NextResponse.json({ message: "Validation Error", success: false, errors: parseResult.error });
        }
        const response = await createTable(data);
        return NextResponse.json(response);

    }
    catch(err){
        console.error(err);
        return NextResponse.json({ message: "Internal Server Error", error: err,success:false });
    }
}