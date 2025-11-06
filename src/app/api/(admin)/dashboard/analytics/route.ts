
import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import ConnectDb from "../../../../../../middleware/connectdb";
import Order from "../../../../../../models/Order";
import StockTransaction from "../../../../../../models/StockTransaction";
import InventoryItem from "../../../../../../models/InventoryItem";
import Menu from "../../../../../../models/Menu";
import Table from "../../../../../../models/Table";
import Category from "../../../../../../models/Category";
export function registerModels() {
  // Access the models to ensure they are registered
  void Category;
  void Menu;
  void Order;
  void StockTransaction;
  void InventoryItem;
  void Table;
}
export async function GET(request: NextRequest) {
    try {
        await ConnectDb();
        registerModels();
        const reqHeaders = await headers();
        const authHeader = reqHeaders.get("Authorization");
        const result = await verifyAdminToken(authHeader || "");

        if (!result.success) {
            return NextResponse.json({
                error: "Unauthorized Access",
                success: false,
                message: "Invalid token"
            }, { status: 401 });
        }

        

        const url = new URL(request.url);
        const period = url.searchParams.get("period") || "day";
        const startDateParam = url.searchParams.get("startDate");
        const endDateParam = url.searchParams.get("endDate");

        const now = new Date();
        let startDate: Date;
        let endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        if (startDateParam && endDateParam) {
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else {
            switch (period) {
                case 'day':
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(startDate.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setDate(startDate.getDate() - 30);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'year':
                    startDate = new Date(now);
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                default:
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
            }
        }
   const orders = await Order.find({
  orderDate: { $gte: startDate, $lte: endDate },
})
.populate({
  path: "items.menuid",
  populate: {
    path: "category", 
    model: "Category",
  },
})
.sort({ orderDate: 1 });

console.log('Fetched orders count:', orders[0]?.items|| 0);


        // Fetch stock transactions for the period
        const stockTransactions = await StockTransaction.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('item');

        // Fetch all inventory items
        const inventoryItems = await InventoryItem.find({});

        // Fetch all menu items
        const menuItems = await Menu.find({});

        // Calculate Revenue Metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const paidRevenue = orders
            .filter(order => order.paymentStatus === 'paid')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingRevenue = orders
            .filter(order => order.paymentStatus === 'pending')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate Expenditure from Stock Purchases
        const purchaseTransactions = stockTransactions.filter(
            t => t.type === 'purchase'
        );
        const totalExpenditure = purchaseTransactions.reduce(
            (sum, transaction) => sum + (transaction.totalCost || 0), 0
        );

        // Calculate Stock Usage Cost (COGS - Cost of Goods Sold)
        const usageTransactions = stockTransactions.filter(
            t => t.type === 'usage'
        );
        const totalCOGS = usageTransactions.reduce(
            (sum, transaction) => sum + (transaction.totalCost || 0), 0
        );

        // Calculate Waste Cost
        const wasteTransactions = stockTransactions.filter(
            t => t.type === 'waste'
        );
        const totalWasteCost = wasteTransactions.reduce(
            (sum, transaction) => sum + (transaction.totalCost || 0), 0
        );

        // Calculate Gross Profit and Net Profit
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = totalRevenue - totalCOGS - totalWasteCost;

        // Calculate Profit Margins
        const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        // Order Statistics
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'served' || o.status === 'done').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate order fulfillment rate
        const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

        // Top Selling Items Analysis
        const itemSales = new Map<string, { name: string; quantity: number; revenue: number; count: number }>();

        orders.forEach(order => {
            order.items?.forEach((item: any) => {
                const menuItem = item.menuid;
                if (menuItem && menuItem._id) {
                    const key = menuItem._id.toString();
                    const existing = itemSales.get(key);
                    const itemRevenue = (menuItem.price || 0) * (item.quantity || 1);

                    if (existing) {
                        existing.quantity += item.quantity || 1;
                        existing.revenue += itemRevenue;
                        existing.count += 1;
                    } else {
                        itemSales.set(key, {
                            name: menuItem.name || 'Unknown',
                            quantity: item.quantity || 1,
                            revenue: itemRevenue,
                            count: 1
                        });
                    }
                }
            });
        });

        const topSellingItems = Array.from(itemSales.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Inventory Value Analysis
        const totalInventoryValue = inventoryItems.reduce(
            (sum, item) => sum + (item.totalValue || 0), 0
        );
        const lowStockItems = inventoryItems.filter(
            item => item.currentStock <= item.minimumStock
        );
        const outOfStockItems = inventoryItems.filter(
            item => item.currentStock === 0
        );

        // Time-based Revenue Trend (daily breakdown for the period)
        const revenueTrend = calculateDailyTrend(orders, startDate, endDate);

        // Peak Hours Analysis (hourly breakdown)
        const peakHours = calculatePeakHours(orders);

        // Payment Method Distribution
        const paymentMethodStats = orders.reduce((acc, order) => {
            const method = order.paymentMethod || 'Not Specified';
            if (!acc[method]) {
                acc[method] = { count: 0, revenue: 0 };
            }
            acc[method].count += 1;
            acc[method].revenue += order.totalAmount || 0;
            return acc;
        }, {} as Record<string, { count: number; revenue: number }>);

        // Category-wise Revenue Analysis
        const categoryRevenue = new Map<string, { name: string; revenue: number; orders: number }>();

        for (const order of orders) {
            if (order.items) {
                for (const item of order.items) {
                    const menuItem = item.menuid as any;
                    if (menuItem && menuItem.category) {
                        const categoryId = typeof menuItem.category === 'object'
                            ? menuItem.category._id?.toString()
                            : menuItem.category.toString();
                        const categoryName = typeof menuItem.category === 'object'
                            ? menuItem.category.name || 'Unknown'
                            : 'Category';

                        const itemRevenue = (menuItem.price || 0) * (item.quantity || 1);
                        const existing = categoryRevenue.get(categoryId);

                        if (existing) {
                            existing.revenue += itemRevenue;
                            existing.orders += 1;
                        } else {
                            categoryRevenue.set(categoryId, {
                                name: categoryName,
                                revenue: itemRevenue,
                                orders: 1
                            });
                        }
                    }
                }
            }
        }

        const categoryAnalysis = Array.from(categoryRevenue.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue);

        // Stock Transaction Analysis by Type
        const transactionsByType = stockTransactions.reduce((acc, transaction) => {
            const type = transaction.type;
            if (!acc[type]) {
                acc[type] = { count: 0, totalCost: 0, totalQuantity: 0 };
            }
            acc[type].count += 1;
            acc[type].totalCost += transaction.totalCost || 0;
            acc[type].totalQuantity += Math.abs(transaction.quantity || 0);
            return acc;
        }, {} as Record<string, { count: number; totalCost: number; totalQuantity: number }>);

        // Table Utilization Metrics
        const tables = await Table.find({});
        const tableOrders = orders.reduce((acc, order) => {
            const tableNum = order.tableNumber;
            if (!acc[tableNum]) {
                acc[tableNum] = { count: 0, revenue: 0 };
            }
            acc[tableNum].count += 1;
            acc[tableNum].revenue += order.totalAmount || 0;
            return acc;
        }, {} as Record<string, { count: number; revenue: number }>);

        const tableUtilization = Object.entries(tableOrders)
            .map(([tableNumber, data]) => {
                const stats = data as { count: number; revenue: number };
                return {
                    tableNumber,
                    count: stats.count,
                    revenue: stats.revenue
                };
            })
            .sort((a, b) => b.revenue - a.revenue);

        // Calculate comparison with previous period
        const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - periodLength);
        const previousEndDate = new Date(startDate);
        previousEndDate.setMilliseconds(-1);

        const previousOrders = await Order.find({
            orderDate: { $gte: previousStartDate, $lte: previousEndDate }
        });

        const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const revenueGrowth = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : totalRevenue > 0 ? 100 : 0;

        const previousOrderCount = previousOrders.length;
        const orderGrowth = previousOrderCount > 0
            ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
            : totalOrders > 0 ? 100 : 0;

        const previousStockTransactions = await StockTransaction.find({
            createdAt: { $gte: previousStartDate, $lte: previousEndDate },
            type: 'purchase'
        });
        const previousExpenditure = previousStockTransactions.reduce(
            (sum, t) => sum + (t.totalCost || 0), 0
        );
        const expenditureGrowth = previousExpenditure > 0
            ? ((totalExpenditure - previousExpenditure) / previousExpenditure) * 100
            : totalExpenditure > 0 ? 100 : 0;

        const analytics = {
            period: {
                type: period,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                days: periodLength
            },
            financial: {
                revenue: {
                    total: parseFloat(totalRevenue.toFixed(2)),
                    paid: parseFloat(paidRevenue.toFixed(2)),
                    pending: parseFloat(pendingRevenue.toFixed(2)),
                    growth: parseFloat(revenueGrowth.toFixed(2))
                },
                expenditure: {
                    total: parseFloat(totalExpenditure.toFixed(2)),
                    purchases: parseFloat(totalExpenditure.toFixed(2)),
                    waste: parseFloat(totalWasteCost.toFixed(2)),
                    cogs: parseFloat(totalCOGS.toFixed(2)),
                    growth: parseFloat(expenditureGrowth.toFixed(2))
                },
                profit: {
                    gross: parseFloat(grossProfit.toFixed(2)),
                    net: parseFloat(netProfit.toFixed(2)),
                    grossMargin: parseFloat(grossProfitMargin.toFixed(2)),
                    netMargin: parseFloat(netProfitMargin.toFixed(2))
                }
            },
            orders: {
                total: totalOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                pending: totalOrders - completedOrders - cancelledOrders,
                avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
                fulfillmentRate: parseFloat(fulfillmentRate.toFixed(2)),
                growth: parseFloat(orderGrowth.toFixed(2))
            },
            inventory: {
                totalValue: parseFloat(totalInventoryValue.toFixed(2)),
                lowStockItems: lowStockItems.length,
                outOfStockItems: outOfStockItems.length,
                totalItems: inventoryItems.length,
                stockTransactions: transactionsByType
            },
            trends: {
                daily: revenueTrend,
                peakHours: peakHours,
                topSellingItems: topSellingItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    revenue: parseFloat(item.revenue.toFixed(2)),
                    orders: item.count
                })),
                categoryAnalysis: categoryAnalysis.map(cat => ({
                    name: cat.name,
                    revenue: parseFloat(cat.revenue.toFixed(2)),
                    orders: cat.orders,
                    avgOrderValue: parseFloat((cat.revenue / cat.orders).toFixed(2))
                })),
                tableUtilization: tableUtilization.map(table => ({
                    tableNumber: table.tableNumber,
                    orders: table.count,
                    revenue: parseFloat(table.revenue.toFixed(2)),
                    avgRevenue: parseFloat((table.revenue / table.count).toFixed(2))
                }))
            },
            payments: {
                methods: Object.entries(paymentMethodStats).map(([method, data]) => {
                    const stats = data as { count: number; revenue: number };
                    return {
                        method,
                        count: stats.count,
                        revenue: parseFloat(stats.revenue.toFixed(2)),
                        percentage: parseFloat(((stats.revenue / totalRevenue) * 100).toFixed(2))
                    };
                })
            },
            alerts: {
                lowStock: lowStockItems.map(item => ({
                    name: item.name,
                    currentStock: item.currentStock,
                    minimumStock: item.minimumStock,
                    unit: item.unit
                })),
                outOfStock: outOfStockItems.map(item => ({
                    name: item.name,
                    unit: item.unit
                }))
            }
        };

        return NextResponse.json({
            message: "Analytics data fetched successfully",
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            error: "Internal Server Error",
            success: false,
            message: "Failed to fetch analytics data"
        }, { status: 500 });
    }
}

// Helper function to calculate daily revenue trend
function calculateDailyTrend(orders: any[], startDate: Date, endDate: Date) {
    const dailyRevenue = new Map<string, { revenue: number; orders: number }>();

    // Initialize all days in the period
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyRevenue.set(dateKey, { revenue: 0, orders: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate with actual order data
    orders.forEach(order => {
        const dateKey = new Date(order.orderDate).toISOString().split('T')[0];
        const existing = dailyRevenue.get(dateKey);
        if (existing) {
            existing.revenue += order.totalAmount || 0;
            existing.orders += 1;
        }
    });

    return Array.from(dailyRevenue.entries())
        .map(([date, data]) => ({
            date,
            revenue: parseFloat(data.revenue.toFixed(2)),
            orders: data.orders
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to calculate peak hours
function calculatePeakHours(orders: any[]) {
    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({
        hour,
        orders: 0,
        revenue: 0
    }));

    orders.forEach(order => {
        const hour = new Date(order.orderDate).getHours();
        hourlyStats[hour].orders += 1;
        hourlyStats[hour].revenue += order.totalAmount || 0;
    });

    return hourlyStats
        .map(stat => ({
            hour: stat.hour,
            orders: stat.orders,
            revenue: parseFloat(stat.revenue.toFixed(2))
        }))
        .filter(stat => stat.orders > 0)
        .sort((a, b) => b.orders - a.orders);
}
