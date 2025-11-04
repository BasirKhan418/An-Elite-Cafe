import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../utils/verify";
import { headers } from "next/headers";
import { OrderSchema } from "../../../../../validation/order/order";
import { createOrder,updateOrder } from "../../../../../repository/order/order";
import { changeTableStatus } from "../../../../../repository/tables/changestatus";
import { getAllOrders ,getOrderbyDate,getOrderbyStatus,getOrderbyDateAndStatus} from "../../../../../repository/order/order";
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
        const date = searchParams.get("date");
        const status = searchParams.get("status");
        if(date&&!status){
            const res = await getOrderbyDate(date);
            return NextResponse.json(res, { status: res.success ? 200 : 500 });
        }
        else if(!date&&status){
            const res = await getOrderbyStatus(status);
            return NextResponse.json(res, { status: res.success ? 200 : 500 });
        }
        else if(date&&status){
            const res = await getOrderbyDateAndStatus(date, status);
            return NextResponse.json(res, { status: res.success ? 200 : 500 });
        }
      //get all
        const res = await getAllOrders();
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
        const result = await verifyAdminToken(authHeader||"");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const parseResult = OrderSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid order data" }, { status: 400 });
        }
        //block table
        const blockTableRes = await changeTableStatus(parseResult.data.tableid || "", "occupied");
        if (!blockTableRes.success) {
            return NextResponse.json(blockTableRes, { status: 500 });
        }
        const res = await createOrder(parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
       
    }
    catch (error) {
        console.error(error);
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
        const body = await request.json();
        const parseResult = OrderSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid order data" }, { status: 400 });
        }
        const res = await updateOrder(parseResult.data.orderid || "", parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
        
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}


