import ConnectDb from "../../middleware/connectdb";
import Recipe from "../../models/Recipe";
import InventoryItem from "../../models/InventoryItem";
import StockTransaction from "../../models/StockTransaction";
import mongoose from "mongoose";
import { RecipeData, RecipeUpdateData, RecipeSearchData, RecipeUsageData } from "../../validation/inventory/recipe";

export const getAllRecipes = async () => {
  try {
    await ConnectDb();
    const recipes = await Recipe.find({ isActive: true })
      .populate('ingredients.item', 'name unit averageCostPerUnit')
      .populate('menuItem', 'name price')
      .sort({ name: 1 });
    return { success: true, recipes, message: "Recipes fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch recipes" };
  }
};

export const getRecipeById = async (recipeid: string) => {
  try {
    await ConnectDb();
    const recipe = await Recipe.findOne({ recipeid, isActive: true })
      .populate('ingredients.item', 'name unit averageCostPerUnit currentStock')
      .populate('menuItem', 'name price');
    if (!recipe) {
      return { success: false, message: "Recipe not found" };
    }
    return { success: true, recipe, message: "Recipe fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch recipe" };
  }
};

export const createRecipe = async (recipeData: RecipeData) => {
  try {
    await ConnectDb();
    
    // Check if recipe with same name or recipeid already exists
    const existingRecipe = await Recipe.findOne({
      $or: [{ name: recipeData.name }, { recipeid: recipeData.recipeid }]
    });
    
    if (existingRecipe) {
      return { success: false, message: "Recipe with this name or ID already exists" };
    }
    
    // Verify all ingredients exist
    for (const ingredient of recipeData.ingredients) {
      const item = await InventoryItem.findById(ingredient.item);
      if (!item) {
        return { success: false, message: `Invalid ingredient: ${ingredient.item}` };
      }
    }
    
    // Verify menu item exists if provided
    if (recipeData.menuItem) {
      // Note: You might want to import Menu model and verify it exists
      // const menuItem = await Menu.findById(recipeData.menuItem);
      // if (!menuItem) {
      //   return { success: false, message: "Invalid menu item" };
      // }
    }
    
    const newRecipe = new Recipe(recipeData);
    await newRecipe.save();
    
    // Populate before returning
    await newRecipe.populate('ingredients.item', 'name unit averageCostPerUnit');
    await newRecipe.populate('menuItem', 'name price');
    
    return { success: true, recipe: newRecipe, message: "Recipe created successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to create recipe" };
  }
};

export const updateRecipe = async (recipeid: string, updateData: RecipeUpdateData) => {
  try {
    await ConnectDb();
    
    // Check if updating name and it conflicts with another recipe
    if (updateData.name) {
      const existingRecipe = await Recipe.findOne({
        name: updateData.name,
        recipeid: { $ne: recipeid }
      });
      
      if (existingRecipe) {
        return { success: false, message: "Recipe with this name already exists" };
      }
    }
    
    // Verify ingredients if being updated
    if (updateData.ingredients) {
      for (const ingredient of updateData.ingredients) {
        const item = await InventoryItem.findById(ingredient.item);
        if (!item) {
          return { success: false, message: `Invalid ingredient: ${ingredient.item}` };
        }
      }
    }
    
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { recipeid },
      updateData,
      { new: true, runValidators: true }
    ).populate('ingredients.item', 'name unit averageCostPerUnit')
     .populate('menuItem', 'name price');
    
    if (!updatedRecipe) {
      return { success: false, message: "Recipe not found" };
    }
    
    return { success: true, recipe: updatedRecipe, message: "Recipe updated successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to update recipe" };
  }
};

export const deleteRecipe = async (recipeid: string) => {
  try {
    await ConnectDb();
    
    // Soft delete by setting isActive to false
    const deletedRecipe = await Recipe.findOneAndUpdate(
      { recipeid },
      { isActive: false },
      { new: true }
    );
    
    if (!deletedRecipe) {
      return { success: false, message: "Recipe not found" };
    }
    
    return { success: true, message: "Recipe deleted successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to delete recipe" };
  }
};

export const searchRecipes = async (searchData: RecipeSearchData) => {
  try {
    await ConnectDb();
    
    const query: any = { isActive: true };
    
    if (searchData.type) {
      query.type = searchData.type;
    }
    
    if (searchData.status) {
      query.status = searchData.status;
    }
    
    if (searchData.search && searchData.search.trim() !== "") {
      query.$or = [
        { name: { $regex: searchData.search, $options: "i" } },
        { description: { $regex: searchData.search, $options: "i" } },
        { tags: { $in: [new RegExp(searchData.search, "i")] } }
      ];
    }
    
    if (searchData.menuItem) {
      // Convert string to MongoDB ObjectId for proper comparison
      try {
        query.menuItem = new mongoose.Types.ObjectId(searchData.menuItem);
      } catch (e) {
        return { success: false, message: "Invalid menu item ID format" };
      }
    }
    
    if (searchData.tags && searchData.tags.length > 0) {
      query.tags = { $in: searchData.tags };
    }
    
    if (searchData.difficulty) {
      query.difficulty = searchData.difficulty;
    }
    
    if (searchData.createdBy) {
      query.createdBy = searchData.createdBy;
    }
    
    const recipes = await Recipe.find(query)
      .populate('ingredients.item', 'name unit averageCostPerUnit')
      .populate('menuItem', 'name price')
      .sort({ name: 1 });
    
    return { success: true, recipes, message: "Recipes searched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to search recipes" };
  }
};

export const useRecipe = async (usageData: RecipeUsageData) => {
  try {
    await ConnectDb();
    
    const recipe = await Recipe.findOne({ recipeid: usageData.recipeid, isActive: true })
      .populate('ingredients.item', 'name unit currentStock averageCostPerUnit');
    
    if (!recipe) {
      return { success: false, message: "Recipe not found" };
    }
    
    // Check if we have enough stock for all ingredients
    const insufficientIngredients = [];
    for (const ingredient of recipe.ingredients) {
      const requiredQuantity = ingredient.quantity * usageData.quantity;
      const item = ingredient.item as any;
      
      if (item.currentStock < requiredQuantity) {
        insufficientIngredients.push({
          name: item.name,
          required: requiredQuantity,
          available: item.currentStock,
          unit: item.unit
        });
      }
    }
    
    if (insufficientIngredients.length > 0) {
      return { 
        success: false, 
        message: "Insufficient stock for ingredients", 
        insufficientIngredients 
      };
    }
    
    // Create stock transactions for each ingredient
    const transactions = [];
    for (const ingredient of recipe.ingredients) {
      const requiredQuantity = ingredient.quantity * usageData.quantity;
      const item = ingredient.item as any;
      
      const transactionData = {
        transactionid: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        item: item._id,
        type: 'usage' as const,
        quantity: -requiredQuantity, // Negative for usage
        unitCost: item.averageCostPerUnit,
        previousStock: item.currentStock,
        newStock: item.currentStock - requiredQuantity,
        reference: `Recipe: ${recipe.name} (${usageData.quantity}x)`,
        notes: usageData.notes || `Used for recipe: ${recipe.name}`,
        performedBy: usageData.performedBy
      };
      
      const transaction = new StockTransaction(transactionData);
      await transaction.save();
      transactions.push(transaction);
      
      // Update item stock
      await InventoryItem.findByIdAndUpdate(item._id, {
        currentStock: item.currentStock - requiredQuantity,
        totalValue: (item.currentStock - requiredQuantity) * item.averageCostPerUnit
      });
    }
    
    // Update recipe usage stats
    await Recipe.findOneAndUpdate(
      { recipeid: usageData.recipeid },
      { 
        lastUsed: new Date(),
        $inc: { usageCount: usageData.quantity }
      }
    );
    
    return { 
      success: true, 
      transactions, 
      message: `Recipe used successfully. ${transactions.length} stock transactions created.` 
    };
  } catch (error) {
    return { success: false, error, message: "Failed to use recipe" };
  }
};

export const getRecipesByMenuItem = async (menuItemId: string) => {
  try {
    await ConnectDb();
    
    const recipes = await Recipe.find({ menuItem: menuItemId, isActive: true })
      .populate('ingredients.item', 'name unit averageCostPerUnit currentStock');
    
    return { success: true, recipes, message: "Menu item recipes fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch menu item recipes" };
  }
};

export const checkRecipeAvailability = async (recipeid: string, quantity: number = 1) => {
  try {
    await ConnectDb();
    
    const recipe = await Recipe.findOne({ recipeid, isActive: true })
      .populate('ingredients.item', 'name unit currentStock');
    
    if (!recipe) {
      return { success: false, message: "Recipe not found" };
    }
    
    const availability = {
      canMake: true,
      maxQuantity: Infinity,
      insufficientIngredients: [] as any[]
    };
    
    for (const ingredient of recipe.ingredients) {
      const item = ingredient.item as any;
      const requiredQuantity = ingredient.quantity * quantity;
      const maxPossible = Math.floor(item.currentStock / ingredient.quantity);
      
      if (item.currentStock < requiredQuantity) {
        availability.canMake = false;
        availability.insufficientIngredients.push({
          name: item.name,
          required: requiredQuantity,
          available: item.currentStock,
          unit: item.unit
        });
      }
      
      availability.maxQuantity = Math.min(availability.maxQuantity, maxPossible);
    }
    
    return { success: true, availability, message: "Recipe availability checked successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to check recipe availability" };
  }
};