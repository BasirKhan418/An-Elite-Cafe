import ConnectDb from "../../middleware/connectdb";
import Coupon from "../../models/Coupon";
import Order from "../../models/Order";

export const createBill = async (orderId: string, data: any) => {
  try {
    await ConnectDb();
    const { coupon = [], taxpercentage = 0 } = data;

    const order = await Order.findOne({ orderid: orderId });
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    let totalAmount = order.totalAmount;
    let discountPercentage = 0;

    // ✅ Apply coupon discounts (if any)
    if (Array.isArray(coupon) && coupon.length > 0) {
      await Promise.all(
        coupon.map(async (item: string) => {
          const couponData = await Coupon.findOne({ couponcode: item }); // correct key
          if (couponData) {
            if (couponData.totalUsageLimit > 0) {
              await Coupon.updateOne(
                { couponcode: item },
                { $inc: { totalUsageLimit: -1 } }
              );
              discountPercentage += couponData.discountPercentage;
            }
          }
        })
      );
    }

    // ✅ Apply discount before tax
    const discountAmount = (totalAmount * discountPercentage) / 100;
    totalAmount -= discountAmount;

    // ✅ Apply tax on discounted amount
    const taxAmount = (taxpercentage / 100) * totalAmount;
    totalAmount += taxAmount;

    // ✅ Prevent negative values and ceil the final result
    totalAmount = Math.ceil(totalAmount < 0 ? 0 : totalAmount);

    await Order.updateOne(
      { orderid: orderId },
      {
        totalAmount,
        tax: taxpercentage,
        discount: discountPercentage,
      }
    );

    return {
      success: true,
      totalAmount,
      totalTax: taxpercentage,
      totalDiscount: discountPercentage,
      message: "Bill created successfully",
    };
  } catch (error) {
    return { success: false, error, message: "Failed to create bill" };
  }
};
