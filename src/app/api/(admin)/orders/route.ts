import { NextResponse, NextRequest } from "next/server";
import { requirePermission } from "../../../../../middleware/adminAuth";
import { AdminPermissions } from "../../../../../models/Admin";
import ConnectDb from "../../../../../middleware/connectdb";
import Order from "../../../../../models/Order";

async function handleGetOrders(request: NextRequest) {
    try {
        await ConnectDb();
        
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const tableid = url.searchParams.get('tableid');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        
        const filter: any = {};
        if (status) filter.status = status;
        if (tableid) filter.tableid = tableid;
        
        const skip = (page - 1) * limit;
        
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await Order.countDocuments(filter);
        
        return NextResponse.json({ 
            message: "Orders fetched successfully", 
            success: true, 
            data: {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleUpdateOrderStatus(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderid, status, paymentStatus } = body;
        
        if (!orderid) {
            return NextResponse.json({ 
                message: "Order ID is required", 
                success: false 
            });
        }

        await ConnectDb();
        
        const updateData: any = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        
        if (status === 'served') {
            updateData.completedAt = new Date();
        }
        
        const order = await Order.findOneAndUpdate(
            { orderid }, 
            updateData, 
            { new: true }
        );
        
        if (!order) {
            return NextResponse.json({ 
                message: "Order not found", 
                success: false 
            });
        }
        
        return NextResponse.json({ 
            message: "Order updated successfully", 
            success: true, 
            data: order 
        });
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

async function handleGetOrderStats(request: NextRequest) {
    try {
        await ConnectDb();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [todayStats, totalStats] = await Promise.all([
            Order.aggregate([
                { $match: { orderDate: { $gte: today } } },
                { 
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]),
            Order.aggregate([
                { 
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        avgOrderValue: { $avg: '$totalAmount' }
                    }
                }
            ])
        ]);
        
        return NextResponse.json({ 
            message: "Order statistics fetched successfully", 
            success: true, 
            data: {
                today: todayStats,
                overall: totalStats[0] || {}
            }
        });
    } catch (err) {
        return NextResponse.json({ 
            message: "Internal Server Error", 
            success: false, 
            error: err 
        });
    }
}

export const GET = requirePermission(AdminPermissions.VIEW_ORDERS, handleGetOrders);
export const PUT = requirePermission(AdminPermissions.MANAGE_ORDERS, handleUpdateOrderStatus);
export const POST = requirePermission(AdminPermissions.VIEW_ANALYTICS, handleGetOrderStats);