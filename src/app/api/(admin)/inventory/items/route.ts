import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import { InventoryItemSchema, InventoryItemUpdateSchema, InventoryItemSearchSchema } from "../../../../../../validation/inventory/inventoryItem";
import { 
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventoryItems,
  getLowStockItems,
  getInventoryValue
} from "../../../../../../repository/inventory/inventoryItem";

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
    const itemid = url.searchParams.get("itemid");
    const lowStock = url.searchParams.get("lowStock");
    const stats = url.searchParams.get("stats");
    
    if (stats === "true") {
      const result = await getInventoryValue();
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    if (itemid) {
      const result = await getInventoryItemById(itemid);
      return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }
    
    if (lowStock === "true") {
      const result = await getLowStockItems();
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    const searchParams = {
      category: url.searchParams.get("category") || undefined,
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
      lowStock: url.searchParams.get("lowStock") === "true" || undefined,
      isPerishable: url.searchParams.get("isPerishable") === "true" ? true : 
                   url.searchParams.get("isPerishable") === "false" ? false : undefined,
      tags: url.searchParams.get("tags")?.split(",") || undefined
    };
    
    const filteredSearchParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredSearchParams).length > 0) {
      const validation = InventoryItemSearchSchema.safeParse(filteredSearchParams);
      if (!validation.success) {
        return NextResponse.json({
          error: "Validation Error",
          success: false,
          message: "Invalid search parameters",
          details: validation.error.issues
        }, { status: 400 });
      }
      
      const result = await searchInventoryItems(validation.data);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    const items = await getAllInventoryItems();
    return NextResponse.json(items, { status: items.success ? 200 : 500 });
    
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
    console.log('Received body:', JSON.stringify(body, null, 2));
    
    const validation = InventoryItemSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation failed:', JSON.stringify(validation.error.issues, null, 2));
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    console.log('Validation passed! Creating item...');
    const itemResult = await createInventoryItem(validation.data);
    console.log('Item creation result:', JSON.stringify(itemResult, null, 2));
    return NextResponse.json(itemResult, { 
      status: itemResult.success ? 201 : 400 
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
    
    if (!body.itemid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Item ID is required"
      }, { status: 400 });
    }
    
    const validation = InventoryItemUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const itemResult = await updateInventoryItem(body.itemid, validation.data);
    return NextResponse.json(itemResult, { 
      status: itemResult.success ? 200 : 400 
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
    const itemid = url.searchParams.get("itemid");
    
    if (!itemid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Item ID is required"
      }, { status: 400 });
    }
    
    const itemResult = await deleteInventoryItem(itemid);
    return NextResponse.json(itemResult, { 
      status: itemResult.success ? 200 : 400 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}