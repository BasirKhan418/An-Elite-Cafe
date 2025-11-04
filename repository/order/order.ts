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

    let totalAmount = 0;

    for (const item of data.items) {
      const menuItem = await Menu.findById(item.menuid);
      if (menuItem) {
        totalAmount += menuItem.price * (item.quantity || 1);
      }
    }

    const orderData = { ...data, totalAmount, subtotal: totalAmount };
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
