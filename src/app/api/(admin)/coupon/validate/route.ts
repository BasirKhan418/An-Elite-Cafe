import { NextResponse,NextRequest } from "next/server";
import { headers } from "next/headers";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { ValidateCoupon } from "../../../../../../repository/coupon/validate";

export async function POST(request: NextRequest) {
    try{
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader||"");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const { couponcode } = body;
        const res = await ValidateCoupon(couponcode);
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }
    catch(error){
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}