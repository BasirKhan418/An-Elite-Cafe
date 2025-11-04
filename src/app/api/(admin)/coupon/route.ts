import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../utils/verify";
import { headers } from "next/headers";
import { CouponSchema } from "../../../../../validation/coupon/coupon";
import { getAllCoupons,createCoupon,deleteCoupon,updateCoupon } from "../../../../../repository/coupon/coupon";
export async function GET(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const res = await getAllCoupons();
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        // Implementation for creating a coupon will go here
        const body = await request.json();
        const parseResult = CouponSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid coupon data" }, { status: 400 });
        }
        const res = await createCoupon(parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        // Implementation for creating a coupon will go here
        const body = await request.json();
        const parseResult = CouponSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid coupon data" }, { status: 400 });
        }
        const res = await updateCoupon(parseResult.data.id||"", parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const res = await deleteCoupon(body.id || "");
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

