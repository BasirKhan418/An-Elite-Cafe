import ConnectDb from "../../middleware/connectdb";
import Order from "../../models/Order";
import Menu from "../../models/Menu";
export const createOrder = async (data: any) => {
    try {
        await ConnectDb();

        let totalAmount = 0;

        for (const item of data.items) {
            const menuItem = await Menu.findById(item.menuid);
            if (menuItem) {
                totalAmount += menuItem.price * (item.quantity || 1);
            }
        }

        const orderData = { ...data, totalAmount, subtotal: totalAmount };
        const order = new Order(orderData);
        await order.save();

        return { success: true, order, message: "Order created successfully" };
    } catch (error) {
        console.error(error);
        return { success: false, error, message: "Failed to create order" };
    }
};

export const updateOrder = async (orderid: string, data: any) => {
    try {
        await ConnectDb();

        let orderData = { ...data };
        
        // Only calculate totals if items are being updated
        if (data.items && data.items.length > 0) {
            let totalAmount = 0;
            for (const item of data.items) {
                const menuItem = await Menu.findById(item.menuid);
                if (menuItem) {
                    totalAmount += menuItem.price * (item.quantity || 1);
                }
            }
            orderData = { ...data, totalAmount, subtotal: totalAmount };
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { orderid },
            orderData,
            { new: true }
        );
        if (!updatedOrder) {
            return { success: false, message: "Order not found" };
        }

        return { success: true, order: updatedOrder, message: "Order updated successfully" };
    } catch (error) {
        console.error(error);
        return { success: false, error, message: "Failed to update order" };
    }
};

export const getAllOrders = async () => {
    try {
        await ConnectDb();
        const orders = await Order.find().populate('items.menuid', 'name price category image').sort({ createdAt: -1 });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error, message: "Failed to fetch orders" };
    }
}

export const getOrderbyDate = async (date: string) => {
    try {
        await ConnectDb();
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        const orders = await Order.find({ orderDate: { $gte: start, $lte: end } }).populate('items.menuid', 'name price category image').sort({ createdAt: -1 });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error, message: "Failed to fetch orders by date" };
    }
}
export const getOrderbyStatus = async (status: string) => {
    try {
        await ConnectDb();
        const orders = await Order.find({ status: status }).populate('items.menuid', 'name price category image').sort({ createdAt: -1 });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error, message: "Failed to fetch orders by status" };
    }
}

export const getOrderbyDateAndStatus = async (date: string, status: string) => {
    try {
        await ConnectDb();
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        const orders = await Order.find({ orderDate: { $gte: start, $lte: end }, status: status }).populate('items.menuid', 'name price category image').sort({ createdAt: -1 });
        return { success: true, orders };
    } catch (error) {
        return { success: false, error, message: "Failed to fetch orders by date and status" };
    }
}