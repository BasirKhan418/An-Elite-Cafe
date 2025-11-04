import ConnectDb from "../../middleware/connectdb";
import InventoryCategory from "../../models/InventoryCategory";
import { InventoryCategoryData, InventoryCategoryUpdateData } from "../../validation/inventory/inventoryCategory";

export const getAllInventoryCategories = async () => {
  try {
    await ConnectDb();
    const categories = await InventoryCategory.find({ isActive: true }).sort({ name: 1 });
    return { success: true, categories, message: "Categories fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch categories" };
  }
};

export const getInventoryCategoryById = async (categoryid: string) => {
  try {
    await ConnectDb();
    const category = await InventoryCategory.findOne({ categoryid, isActive: true });
    if (!category) {
      return { success: false, message: "Category not found" };
    }
    return { success: true, category, message: "Category fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch category" };
  }
};

export const createInventoryCategory = async (categoryData: InventoryCategoryData) => {
  try {
    await ConnectDb();
    
    // Check if category with same name or categoryid already exists
    const existingCategory = await InventoryCategory.findOne({
      $or: [{ name: categoryData.name }, { categoryid: categoryData.categoryid }]
    });
    
    if (existingCategory) {
      return { success: false, message: "Category with this name or ID already exists" };
    }
    
    const newCategory = new InventoryCategory(categoryData);
    await newCategory.save();
    
    return { success: true, category: newCategory, message: "Category created successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to create category" };
  }
};

export const updateInventoryCategory = async (categoryid: string, updateData: InventoryCategoryUpdateData) => {
  try {
    await ConnectDb();
    
    // Check if updating name and it conflicts with another category
    if (updateData.name) {
      const existingCategory = await InventoryCategory.findOne({
        name: updateData.name,
        categoryid: { $ne: categoryid }
      });
      
      if (existingCategory) {
        return { success: false, message: "Category with this name already exists" };
      }
    }
    
    const updatedCategory = await InventoryCategory.findOneAndUpdate(
      { categoryid },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return { success: false, message: "Category not found" };
    }
    
    return { success: true, category: updatedCategory, message: "Category updated successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to update category" };
  }
};

export const deleteInventoryCategory = async (categoryid: string) => {
  try {
    await ConnectDb();
    
    // Soft delete by setting isActive to false
    const deletedCategory = await InventoryCategory.findOneAndUpdate(
      { categoryid },
      { isActive: false },
      { new: true }
    );
    
    if (!deletedCategory) {
      return { success: false, message: "Category not found" };
    }
    
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to delete category" };
  }
};

export const searchInventoryCategories = async (searchTerm: string, type?: string) => {
  try {
    await ConnectDb();
    
    const query: any = { isActive: true };
    
    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }
    
    if (type) {
      query.type = type;
    }
    
    const categories = await InventoryCategory.find(query).sort({ name: 1 });
    
    return { success: true, categories, message: "Categories searched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to search categories" };
  }
};