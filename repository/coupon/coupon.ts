import ConnectDb from "../../middleware/connectdb";
import Coupon from "../../models/Coupon";
export const getAllCoupons = async () => {
    try {
        await ConnectDb();
        const coupons = await Coupon.find({});
        return { success: true, coupons, message: "Coupons fetched successfully" };
    }
    catch (error) {
        return { success: false, error, message: "Failed to fetch coupons" };
    }
}

export const createCoupon = async (data: any) => {
    try {
        await ConnectDb();
        const coupon = new Coupon(data);
        await coupon.save();
        return { success: true, coupon, message: "Coupon created successfully" };
    }
    catch (error) {
        return { success: false, error, message: "Failed to create coupon" };
    }
}

export const updateCoupon = async (id: string, data: any) => {
    try {
        await ConnectDb();
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
        if (!updatedCoupon) {
            return { success: false, message: "Coupon not found" };
        }
        return { success: true, coupon: updatedCoupon, message: "Coupon updated successfully" };
    }
    catch (error) {
        return { success: false, error, message: "Failed to update coupon" };
    }
}

export const deleteCoupon = async (id: string) => {
    try {
        await ConnectDb();
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return { success: false, message: "Coupon not found" };
        }
        return { success: true, coupon: deletedCoupon, message: "Coupon deleted successfully" };
    }
    catch (error) {
        return { success: false, error, message: "Failed to delete coupon" };
    }
}