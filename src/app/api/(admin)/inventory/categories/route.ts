import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import { InventoryCategorySchema, InventoryCategoryUpdateSchema } from "../../../../../../validation/inventory/inventoryCategory";
import { 
  getAllInventoryCategories,
  getInventoryCategoryById,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
  searchInventoryCategories
} from "../../../../../../repository/inventory/inventoryCategory";

export async function GET(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const authHeader = reqHeaders.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const result = await verifyAdminToken(token);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const categoryid = url.searchParams.get("categoryid");
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");
    
    // Get specific category by ID
    if (categoryid) {
      const result = await getInventoryCategoryById(categoryid);
      return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }
    
    // Search categories
    if (search || type) {
      const result = await searchInventoryCategories(search || "", type || undefined);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    // Get all categories
    const categories = await getAllInventoryCategories();
    return NextResponse.json(categories, { status: categories.success ? 200 : 500 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const authHeader = reqHeaders.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const result = await verifyAdminToken(token);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validation = InventoryCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const categoryResult = await createInventoryCategory(validation.data);
    return NextResponse.json(categoryResult, { 
      status: categoryResult.success ? 201 : 400 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const authHeader = reqHeaders.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const result = await verifyAdminToken(token);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.categoryid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Category ID is required"
      }, { status: 400 });
    }
    
    // Validate request body
    const validation = InventoryCategoryUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const categoryResult = await updateInventoryCategory(body.categoryid, validation.data);
    return NextResponse.json(categoryResult, { 
      status: categoryResult.success ? 200 : 400 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const authHeader = reqHeaders.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const result = await verifyAdminToken(token);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Unauthorized Access", 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const categoryid = url.searchParams.get("categoryid");
    
    if (!categoryid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Category ID is required"
      }, { status: 400 });
    }
    
    const categoryResult = await deleteInventoryCategory(categoryid);
    return NextResponse.json(categoryResult, { 
      status: categoryResult.success ? 200 : 400 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}