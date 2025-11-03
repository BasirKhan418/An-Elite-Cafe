import { NextResponse,NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../../utils/verify";
import { headers } from "next/headers";
import { fetchTableById } from "../../../../../../../repository/tables/table";
import { updateTableStatus } from "../../../../../../../repository/tables/tablecrud";
export async function GET(request: NextRequest, { params }: { params: { tableid: string } }) {
    try {
        const { tableid } = await params;
        const headersList = await headers();
        const adminToken = headersList.get("Authorization");
        const verificationResult = verifyAdminToken(adminToken || "");
        if (!verificationResult.success) {
            return NextResponse.json({ message: verificationResult.message, success: false });
        }
        
        const tableResult = await fetchTableById(tableid);
        if (!tableResult.success) {
            return NextResponse.json({ message: tableResult.message, success: false });
        }

        return NextResponse.json({ message: "Table status fetched successfully", table: tableResult.table, success: true });
    } catch (err) {
        return NextResponse.json({ message: "Internal Server Error", error: err, success: false });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { tableid: string } }) {
    try{
        const { tableid } = await params;
        const data = await request.json();
        const headersList = await headers();
        const adminToken = headersList.get("Authorization");
        const verificationResult = verifyAdminToken(adminToken || "");
        if (!verificationResult.success) {
            return NextResponse.json({ message: verificationResult.message, success: false });
        }
        //todo:update table status logic here
        const response = await updateTableStatus(tableid,data.status);
        return NextResponse.json(response);
    }
    catch(err){
        return NextResponse.json({ message: "Internal Server Error", error: err, success: false });
    }
}