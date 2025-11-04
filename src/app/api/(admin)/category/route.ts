import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../utils/verify";
import { headers } from "next/headers";
import { CategorySchema } from "../../../../../validation/category/category";
import { getAllCategories,createCategory, updateCategory, deleteCategory } from "../../../../../repository/category/category";

export async function GET(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        
        const token = authHeader.substring(7); 
        const result = await verifyAdminToken(token);
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const categories = await getAllCategories();
        return NextResponse.json({ categories ,success:true}, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        
        const token = authHeader.substring(7); 
        const result = await verifyAdminToken(token);
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const parseResult = CategorySchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid category data" }, { status: 400 });
        }
        const res = await createCategory(parseResult.data);
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
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        
        const token = authHeader.substring(7); 
        const result = await verifyAdminToken(token);
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();
        const parseResult = CategorySchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error, success: false, message: "Invalid category data" }, { status: 400 });
        }
        const res = await updateCategory(parseResult.data.categoryid, parseResult.data);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        
        const token = authHeader.substring(7); 
        const result = await verifyAdminToken(token);
        if (!result.success) {
            return NextResponse.json({ error: "Unauthorized Access", success: false, message: "Invalid token" }, { status: 401 });
        }
        const body = await request.json();

        const res = await deleteCategory(body.categoryid);
        return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false, message: "An unexpected error occurred" }, { status: 500 });
    }
}

