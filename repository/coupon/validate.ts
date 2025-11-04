import ConnectDb from "../../middleware/connectdb";
import Coupon from "../../models/Coupon";
export const ValidateCoupon = async (couponcode: string) => {
    try {
        await ConnectDb();
        const coupon = await Coupon.findOne({ couponcode });
        if (!coupon) {
            return { success: false, message: "Invalid coupon code" };
        }
        if( coupon.totalUsageLimit !== null && coupon.totalUsageLimit <= 0 ) {
            return { success: false, message: "Coupon usage limit exceeded" };
        }
        return { success: true, coupon, message: "Coupon is valid" };
    }
    catch (error) {
        return { success: false, error, message: "Failed to fetch coupons" };
    }
}