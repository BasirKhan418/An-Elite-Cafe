import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import { StockTransactionSchema, StockTransactionUpdateSchema, StockTransactionSearchSchema } from "../../../../../../validation/inventory/stockTransaction";
import { 
  getAllStockTransactions,
  getStockTransactionById,
  createStockTransaction,
  updateStockTransaction,
  searchStockTransactions,
  getTransactionsByItem,
  getTransactionStats
} from "../../../../../../repository/inventory/stockTransaction";

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
    const transactionid = url.searchParams.get("transactionid");
    const itemid = url.searchParams.get("itemid");
    const stats = url.searchParams.get("stats");
    
    // Get transaction statistics
    if (stats === "true") {
      const dateFrom = url.searchParams.get("dateFrom") || undefined;
      const dateTo = url.searchParams.get("dateTo") || undefined;
      const result = await getTransactionStats(dateFrom, dateTo);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    // Get specific transaction by ID
    if (transactionid) {
      const result = await getStockTransactionById(transactionid);
      return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }
    
    // Get transactions for specific item
    if (itemid) {
      const result = await getTransactionsByItem(itemid);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    // Search transactions with filters
    const searchParams = {
      itemid: url.searchParams.get("itemid") || undefined,
      type: url.searchParams.get("type") || undefined,
      status: url.searchParams.get("status") || undefined,
      performedBy: url.searchParams.get("performedBy") || undefined,
      reference: url.searchParams.get("reference") || undefined,
      dateFrom: url.searchParams.get("dateFrom") || undefined,
      dateTo: url.searchParams.get("dateTo") || undefined
    };
    
    // Remove undefined values
    const filteredSearchParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredSearchParams).length > 0) {
      const validation = StockTransactionSearchSchema.safeParse(filteredSearchParams);
      if (!validation.success) {
        return NextResponse.json({
          error: "Validation Error",
          success: false,
          message: "Invalid search parameters",
          details: validation.error.issues
        }, { status: 400 });
      }
      
      const result = await searchStockTransactions(validation.data);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    // Get all transactions
    const transactions = await getAllStockTransactions();
    return NextResponse.json(transactions, { status: transactions.success ? 200 : 500 });
    
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
    const validation = StockTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const transactionResult = await createStockTransaction(validation.data);
    return NextResponse.json(transactionResult, { 
      status: transactionResult.success ? 201 : 400 
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
    
    if (!body.transactionid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Transaction ID is required"
      }, { status: 400 });
    }
    
    // Validate request body
    const validation = StockTransactionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const transactionResult = await updateStockTransaction(body.transactionid, validation.data);
    return NextResponse.json(transactionResult, { 
      status: transactionResult.success ? 200 : 400 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}