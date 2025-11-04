import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import { RecipeSchema, RecipeUpdateSchema, RecipeSearchSchema, RecipeUsageSchema } from "../../../../../../validation/inventory/recipe";
import { 
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  useRecipe,
  getRecipesByMenuItem,
  checkRecipeAvailability
} from "../../../../../../repository/inventory/recipe";

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
    const recipeid = url.searchParams.get("recipeid");
    const menuItemId = url.searchParams.get("menuItemId");
    const checkAvailability = url.searchParams.get("checkAvailability");
    const quantity = url.searchParams.get("quantity");
    
    if (checkAvailability === "true" && recipeid) {
      const qty = quantity ? parseInt(quantity) : 1;
      const result = await checkRecipeAvailability(recipeid, qty);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    if (recipeid) {
      const result = await getRecipeById(recipeid);
      return NextResponse.json(result, { status: result.success ? 200 : 404 });
    }
    
    if (menuItemId) {
      const result = await getRecipesByMenuItem(menuItemId);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    const searchParams = {
      type: url.searchParams.get("type") || undefined,
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
      menuItem: url.searchParams.get("menuItem") || undefined,
      tags: url.searchParams.get("tags")?.split(",") || undefined,
      difficulty: url.searchParams.get("difficulty") || undefined,
      createdBy: url.searchParams.get("createdBy") || undefined
    };
    
    const filteredSearchParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredSearchParams).length > 0) {
      const validation = RecipeSearchSchema.safeParse(filteredSearchParams);
      if (!validation.success) {
        return NextResponse.json({
          error: "Validation Error",
          success: false,
          message: "Invalid search parameters",
          details: validation.error.issues
        }, { status: 400 });
      }
      
      const result = await searchRecipes(validation.data);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    
    const recipes = await getAllRecipes();
    return NextResponse.json(recipes, { status: recipes.success ? 200 : 500 });
    
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
    const action = body.action;
    
    if (action === "use") {
      const validation = RecipeUsageSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({
          error: "Validation Error",
          success: false,
          message: "Invalid usage data provided",
          details: validation.error.issues
        }, { status: 400 });
      }
      
      const usageResult = await useRecipe(validation.data);
      return NextResponse.json(usageResult, { 
        status: usageResult.success ? 200 : 400 
      });
    }
    
    const validation = RecipeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const recipeResult = await createRecipe(validation.data);
    return NextResponse.json(recipeResult, { 
      status: recipeResult.success ? 201 : 400 
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
    
    if (!body.recipeid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Recipe ID is required"
      }, { status: 400 });
    }
    
    const validation = RecipeUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Invalid data provided",
        details: validation.error.issues
      }, { status: 400 });
    }
    
    const recipeResult = await updateRecipe(body.recipeid, validation.data);
    return NextResponse.json(recipeResult, { 
      status: recipeResult.success ? 200 : 400 
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
    const recipeid = url.searchParams.get("recipeid");
    
    if (!recipeid) {
      return NextResponse.json({
        error: "Validation Error",
        success: false,
        message: "Recipe ID is required"
      }, { status: 400 });
    }
    
    const recipeResult = await deleteRecipe(recipeid);
    return NextResponse.json(recipeResult, { 
      status: recipeResult.success ? 200 : 400 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal Server Error", 
      success: false, 
      message: "An unexpected error occurred" 
    }, { status: 500 });
  }
}