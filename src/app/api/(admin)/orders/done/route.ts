import { NextResponse,NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import { MarkOrderAsDone } from "../../../../../../repository/order/bill";
export async function POST(request: NextRequest) {
    try{
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader||"");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const { orderid, paymentmode } = body;
        const res = await MarkOrderAsDone(orderid, { paymentmode });
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}