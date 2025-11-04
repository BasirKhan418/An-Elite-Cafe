import ConnectDb from "../../middleware/connectdb";
import InventoryItem from "../../models/InventoryItem";
import mongoose from "mongoose";
import { InventoryItemData, InventoryItemUpdateData, InventoryItemSearchData } from "../../validation/inventory/inventoryItem";

export const getAllInventoryItems = async () => {
  try {
    await ConnectDb();
    const items = await InventoryItem.find({ isActive: true })
      .sort({ name: 1 });
    return { success: true, items, message: "Items fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch items" };
  }
};

export const getInventoryItemById = async (itemid: string) => {
  try {
    await ConnectDb();
    const item = await InventoryItem.findOne({ itemid, isActive: true });
    if (!item) {
      return { success: false, message: "Item not found" };
    }
    return { success: true, item, message: "Item fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch item" };
  }
};

export const createInventoryItem = async (itemData: InventoryItemData) => {
  try {
    await ConnectDb();
    
    console.log('Creating inventory item with data:', JSON.stringify(itemData, null, 2));
    
    // Check if item with same name or itemid already exists
    const existingItem = await InventoryItem.findOne({
      $or: [{ name: itemData.name }, { itemid: itemData.itemid }]
    });
    
    if (existingItem) {
      console.log('Item already exists:', existingItem);
      return { success: false, message: "Item with this name or ID already exists" };
    }
    
    const newItem = new InventoryItem(itemData);
    await newItem.save();
    
    console.log('Item created successfully:', newItem);
    return { success: true, item: newItem, message: "Item created successfully" };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error, message: "Failed to create item" };
  }
};

export const updateInventoryItem = async (itemid: string, updateData: InventoryItemUpdateData) => {
  try {
    await ConnectDb();
    
    if (updateData.name) {
      const existingItem = await InventoryItem.findOne({
        name: updateData.name,
        itemid: { $ne: itemid }
      });
      
      if (existingItem) {
        return { success: false, message: "Item with this name already exists" };
      }
    }
    
    const updatedItem = await InventoryItem.findOneAndUpdate(
      { itemid },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return { success: false, message: "Item not found" };
    }
    
    return { success: true, item: updatedItem, message: "Item updated successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to update item" };
  }
};

export const deleteInventoryItem = async (itemid: string) => {
  try {
    await ConnectDb();
    
    // Soft delete by setting isActive to false
    const deletedItem = await InventoryItem.findOneAndUpdate(
      { itemid },
      { isActive: false },
      { new: true }
    );
    
    if (!deletedItem) {
      return { success: false, message: "Item not found" };
    }
    
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to delete item" };
  }
};

export const searchInventoryItems = async (searchData: InventoryItemSearchData) => {
  try {
    await ConnectDb();
    
    const query: any = { isActive: true };
    
    if (searchData.category) {
      query.category = searchData.category;
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
    
    if (searchData.lowStock) {
      query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
    }
    
    if (searchData.isPerishable !== undefined) {
      query.isPerishable = searchData.isPerishable;
    }
    
    if (searchData.tags && searchData.tags.length > 0) {
      query.tags = { $in: searchData.tags };
    }
    
    const items = await InventoryItem.find(query)
      .sort({ name: 1 });
    
    return { success: true, items, message: "Items searched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to search items" };
  }
};

export const getLowStockItems = async () => {
  try {
    await ConnectDb();
    
    const lowStockItems = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minimumStock"] }
    }).sort({ currentStock: 1 });
    
    return { success: true, items: lowStockItems, message: "Low stock items fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch low stock items" };
  }
};

export const getInventoryValue = async () => {
  try {
    await ConnectDb();
    
    const pipeline = [
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalValue" },
          totalItems: { $sum: 1 },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minimumStock"] }, 1, 0]
            }
          }
        }
      }
    ];
    
    const result = await InventoryItem.aggregate(pipeline);
    const stats = result[0] || { totalValue: 0, totalItems: 0, lowStockItems: 0 };
    
    return { success: true, stats, message: "Inventory value calculated successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to calculate inventory value" };
  }
};