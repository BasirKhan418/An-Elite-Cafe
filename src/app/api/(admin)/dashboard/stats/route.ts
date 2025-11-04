import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken } from "../../../../../../utils/verify";
import { headers } from "next/headers";
import ConnectDb from "../../../../../../middleware/connectdb";
import Table from "../../../../../../models/Table";
import Order from "../../../../../../models/Order";
import Employee from "../../../../../../models/Employee";

export async function GET(request: NextRequest) {
    try {
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

        await ConnectDb();

        const url = new URL(request.url);
        const date = url.searchParams.get("date");
        
        // Get today's date range
        const today = new Date();
        let startDate: Date;
        let endDate: Date;

        if (date) {
            startDate = new Date(date);
            endDate = new Date(date);
        } else {
            startDate = new Date(today);
            endDate = new Date(today);
        }
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Fetch all data in parallel
        const [tables, todayOrders, allOrders, employees] = await Promise.all([
            Table.find({}).sort({ createdAt: -1 }),
            Order.find({
                orderDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ orderDate: -1 }),
            Order.find({}).sort({ orderDate: -1 }).limit(10),
            Employee.find({ isActive: true })
        ]);

        // Calculate table statistics
        const totalTables = tables.length;
        const occupiedTables = tables.filter(table => table.status === 'occupied').length;
        const availableTables = tables.filter(table => table.status === 'available').length;
        const reservedTables = tables.filter(table => table.status === 'reserved').length;

        // Calculate order statistics
        const todayOrdersCount = todayOrders.length;
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Calculate order status counts
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const preparingOrders = allOrders.filter(order => order.status === 'preparing').length;
        const readyOrders = allOrders.filter(order => order.status === 'ready').length;
        const servedOrders = allOrders.filter(order => order.status === 'served').length;

        // Get recent orders with table information
        const recentOrders = allOrders.slice(0, 5).map(order => ({
            orderid: order.orderid,
            tableNumber: order.tableNumber,
            status: order.status,
            totalAmount: order.totalAmount || 0,
            orderDate: order.orderDate,
            items: order.items?.length || 0,
            paymentStatus: order.paymentStatus || 'pending'
        }));

        // Calculate weekly revenue (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const weeklyOrders = await Order.find({
            orderDate: {
                $gte: weekAgo,
                $lte: endDate
            }
        });

        const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate monthly revenue (last 30 days)
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);

        const monthlyOrders = await Order.find({
            orderDate: {
                $gte: monthAgo,
                $lte: endDate
            }
        });

        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate average order value
        const avgOrderValue = todayOrdersCount > 0 ? todayRevenue / todayOrdersCount : 0;

        const stats = {
            tables: {
                total: totalTables,
                occupied: occupiedTables,
                available: availableTables,
                reserved: reservedTables,
                occupancyRate: totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : '0'
            },
            orders: {
                today: todayOrdersCount,
                pending: pendingOrders,
                preparing: preparingOrders,
                ready: readyOrders,
                served: servedOrders,
                total: allOrders.length
            },
            revenue: {
                today: todayRevenue,
                weekly: weeklyRevenue,
                monthly: monthlyRevenue,
                avgOrderValue: avgOrderValue
            },
            employees: {
                total: employees.length,
                active: employees.filter(emp => emp.isActive).length
            },
            recentOrders: recentOrders
        };

        return NextResponse.json({
            message: "Dashboard statistics fetched successfully",
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({
            error: "Internal Server Error",
            success: false,
            message: "Failed to fetch dashboard statistics"
        }, { status: 500 });
    }
}