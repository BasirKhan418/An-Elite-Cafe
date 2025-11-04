import { z } from "zod";
import { id } from "zod/locales";

export const CouponSchema = z.object({
  name: z.string().min(1, "Coupon name is required"),
  couponcode: z.string().min(3, "Coupon code must be at least 3 characters long"),
  discountPercentage: z
    .number()
    .min(0, "Discount must be at least 0%")
    .max(100, "Discount cannot exceed 100%"),
  description: z.string().optional(),
  totalUsageLimit: z.number().nullable().optional(),
  id : z.string().optional(),
});
