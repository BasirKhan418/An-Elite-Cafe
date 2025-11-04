import ConnectDb from "../../middleware/connectdb";
import StockTransaction from "../../models/StockTransaction";
import InventoryItem from "../../models/InventoryItem";
import mongoose from "mongoose";
import { StockTransactionData, StockTransactionUpdateData, StockTransactionSearchData, BulkStockUpdateData } from "../../validation/inventory/stockTransaction";

export const getAllStockTransactions = async () => {
  try {
    await ConnectDb();
    const transactions = await StockTransaction.find()
      .populate('item', 'name unit currentStock')
      .sort({ createdAt: -1 })
      .limit(100); 
    return { success: true, transactions, message: "Transactions fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch transactions" };
  }
};

export const getStockTransactionById = async (transactionid: string) => {
  try {
    await ConnectDb();
    const transaction = await StockTransaction.findOne({ transactionid })
      .populate('item', 'name unit currentStock')
      .populate('relatedTransaction');
    if (!transaction) {
      return { success: false, message: "Transaction not found" };
    }
    return { success: true, transaction, message: "Transaction fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch transaction" };
  }
};

export const createStockTransaction = async (transactionData: StockTransactionData) => {
  try {
    await ConnectDb();
    
    // Verify item exists
    const item = await InventoryItem.findById(transactionData.item);
    if (!item) {
      return { success: false, message: "Invalid item" };
    }
    
    // Check if transaction ID already exists
    const existingTransaction = await StockTransaction.findOne({ transactionid: transactionData.transactionid });
    if (existingTransaction) {
      return { success: false, message: "Transaction with this ID already exists" };
    }
    
    // Calculate stock changes
    const previousStock = item.currentStock;
    let newStock: number;
    
    // For purchase, adjustment (positive), return - add to stock
    // For usage, waste, adjustment (negative), transfer out - subtract from stock
    if (transactionData.type === 'purchase' || transactionData.type === 'return' || 
        (transactionData.type === 'adjustment' && transactionData.quantity > 0)) {
      newStock = previousStock + Math.abs(transactionData.quantity);
    } else {
      newStock = previousStock - Math.abs(transactionData.quantity);
      // Ensure stock doesn't go below zero
      if (newStock < 0) {
        return { success: false, message: "Insufficient stock for this transaction" };
      }
    }
    
    // Create transaction with calculated values
    const transactionWithCalculatedValues = {
      ...transactionData,
      previousStock,
      newStock,
      quantity: transactionData.type === 'usage' || transactionData.type === 'waste' || 
                transactionData.type === 'transfer' ? -Math.abs(transactionData.quantity) : 
                Math.abs(transactionData.quantity)
    };
    
    const newTransaction = new StockTransaction(transactionWithCalculatedValues);
    await newTransaction.save();
    
    // Update item stock and recalculate average cost if it's a purchase
    if (transactionData.type === 'purchase') {
      const totalCost = (item.currentStock * item.averageCostPerUnit) + 
                       (Math.abs(transactionData.quantity) * transactionData.unitCost);
      const totalQuantity = newStock;
      const newAverageCost = totalQuantity > 0 ? totalCost / totalQuantity : item.averageCostPerUnit;
      
      await InventoryItem.findByIdAndUpdate(transactionData.item, {
        currentStock: newStock,
        averageCostPerUnit: newAverageCost,
        totalValue: newStock * newAverageCost
      });
    } else {
      await InventoryItem.findByIdAndUpdate(transactionData.item, {
        currentStock: newStock,
        totalValue: newStock * item.averageCostPerUnit
      });
    }
    
    // Populate item details before returning
    await newTransaction.populate('item', 'name unit currentStock');
    
    return { success: true, transaction: newTransaction, message: "Transaction created successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to create transaction" };
  }
};

export const updateStockTransaction = async (transactionid: string, updateData: StockTransactionUpdateData) => {
  try {
    await ConnectDb();
    
    // For simplicity, only allow updating status and notes
    const allowedUpdates = ['status', 'notes'];
    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = (updateData as any)[key];
        return obj;
      }, {});
    
    const updatedTransaction = await StockTransaction.findOneAndUpdate(
      { transactionid },
      filteredUpdateData,
      { new: true, runValidators: true }
    ).populate('item', 'name unit currentStock');
    
    if (!updatedTransaction) {
      return { success: false, message: "Transaction not found" };
    }
    
    return { success: true, transaction: updatedTransaction, message: "Transaction updated successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to update transaction" };
  }
};

export const searchStockTransactions = async (searchData: StockTransactionSearchData) => {
  try {
    await ConnectDb();
    
    const query: any = {};
    
    if (searchData.itemid) {
      // Convert string to MongoDB ObjectId for proper comparison
      try {
        query.item = new mongoose.Types.ObjectId(searchData.itemid);
      } catch (e) {
        return { success: false, message: "Invalid item ID format" };
      }
    }
    
    if (searchData.type) {
      query.type = searchData.type;
    }
    
    if (searchData.status) {
      query.status = searchData.status;
    }
    
    if (searchData.performedBy) {
      query.performedBy = searchData.performedBy;
    }
    
    if (searchData.reference) {
      query.reference = { $regex: searchData.reference, $options: "i" };
    }
    
    if (searchData.dateFrom || searchData.dateTo) {
      query.createdAt = {};
      if (searchData.dateFrom) {
        query.createdAt.$gte = new Date(searchData.dateFrom);
      }
      if (searchData.dateTo) {
        query.createdAt.$lte = new Date(searchData.dateTo);
      }
    }
    
    const transactions = await StockTransaction.find(query)
      .populate('item', 'name unit')
      .sort({ createdAt: -1 })
      .limit(500); // Limit for performance
    
    return { success: true, transactions, message: "Transactions searched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to search transactions" };
  }
};

export const getTransactionsByItem = async (itemid: string) => {
  try {
    await ConnectDb();
    
    // Convert string to MongoDB ObjectId for proper comparison
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(itemid);
    } catch (e) {
      return { success: false, message: "Invalid item ID format" };
    }
    
    const transactions = await StockTransaction.find({ item: objectId })
      .populate('item', 'name unit')
      .sort({ createdAt: -1 });
    
    return { success: true, transactions, message: "Item transactions fetched successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to fetch item transactions" };
  }
};

export const getTransactionStats = async (dateFrom?: string, dateTo?: string) => {
  try {
    await ConnectDb();
    
    const matchStage: any = {};
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalValue: { $sum: "$totalCost" }
        }
      }
    ];
    
    const stats = await StockTransaction.aggregate(pipeline);
    
    return { success: true, stats, message: "Transaction stats calculated successfully" };
  } catch (error) {
    return { success: false, error, message: "Failed to calculate transaction stats" };
  }
};