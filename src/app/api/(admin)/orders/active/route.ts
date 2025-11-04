import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import { getActiveOrdersByTable } from "../../../../../../repository/order/order";

export async function GET(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const tableid = searchParams.get("tableid");
        
        if (!tableid) {
            return NextResponse.json({ 
                error: "Table ID is required", 
                success: false, 
                message: "Table ID parameter is missing" 
            }, { status: 400 });
        }
        
        const res = await getActiveOrdersByTable(tableid);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            success: false, 
            message: "An unexpected error occurred" 
        }, { status: 500 });
    }
}