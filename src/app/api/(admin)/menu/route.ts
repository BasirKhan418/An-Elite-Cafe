import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../utils/verify";
import { headers } from "next/headers";
import { MenuSchema } from "../../../../../validation/menu/menu";
import { createMenu,updateMenu,deleteMenu,getAllMenus } from "../../../../../repository/menu/menu";
export async function GET(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const token = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(token || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const menus = await getAllMenus();
        return NextResponse.json({ menus,success:true }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const token = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(token || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const parseResult = MenuSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid menu data" }, { status: 400 });
        }
        const res = await createMenu(parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const token = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(token || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const parseResult = MenuSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid menu data" }, { status: 400 });
        }
        const res = await updateMenu(parseResult.data.menuid, parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const token = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(token || "");
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();

        const res = await deleteMenu(body.menuid);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

