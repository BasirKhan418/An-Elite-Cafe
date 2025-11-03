import * as z from "zod";

const EmployeeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.string().min(1, "Role is required"),
    username: z.string().optional(),
    img: z.string().url("Invalid image URL").optional(),
});
export default EmployeeSchema;

export const EmployeeLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const EmployeeLoginSchema2 = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().max(6, "OTP is required").min(6, "OTP must be 6 digits"),
});
