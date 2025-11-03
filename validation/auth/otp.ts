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

export const EmployeeZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().optional(),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  img: z.string().url("Invalid image URL").optional(),
  token: z.string().optional(),
  empid: z.string().optional().default(() => Date.now().toString()),
  resname: z.string().optional().default("An Elite Cafe"),
  joinDate: z.string().optional().default(() => new Date().toISOString()),
  shift: z.string().optional().default("Morning Shift (9 AM - 5 PM)"),
});
