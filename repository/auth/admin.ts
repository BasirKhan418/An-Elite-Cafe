import ConnectDb from "../../middleware/connectdb";
import Admin from "../../models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import setConnectionRedis from "../../middleware/connectRedis";
import { sendOtpEmail } from "../../email/SendOtp";

export const createAdmin = async (adminData: any) => {
    try {
        await ConnectDb();
        
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
        
        const admin = await Admin.create({
            ...adminData,
            password: hashedPassword
        });

        const { password, ...adminResponse } = admin.toObject();
        
        return { message: "Admin created successfully", success: true, data: adminResponse };
    } catch (err: any) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return { message: `Admin with this ${field} already exists`, success: false };
        }
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const loginAdmin = async (credentials: { email: string; password: string }) => {
    try {
        await ConnectDb();
        
        const admin = await Admin.findOne({ 
            email: credentials.email,
            isActive: true 
        });

        if (!admin) {
            return { message: "Invalid credentials", success: false };
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
        
        if (!isPasswordValid) {
            return { message: "Invalid credentials", success: false };
        }

        const token = jwt.sign(
            { 
                adminId: admin._id,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions
            },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        await Admin.findByIdAndUpdate(admin._id, { 
            lastLogin: new Date(),
            token: token
        });

        const { password, ...adminResponse } = admin.toObject();
        
        return { 
            message: "Login successful", 
            success: true, 
            data: { 
                admin: adminResponse, 
                token 
            } 
        };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const getAdminByEmail = async (email: string) => {
    try {
        await ConnectDb();
        const admin = await Admin.findOne({ email: email }).select('-password');
        return { message: "Admin fetched successfully", success: true, data: admin };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const getAdminById = async (id: string) => {
    try {
        await ConnectDb();
        const admin = await Admin.findById(id).select('-password');
        return { message: "Admin fetched successfully", success: true, data: admin };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const updateAdmin = async (id: string, updateData: any) => {
    try {
        await ConnectDb();
        
        if (updateData.password) {
            const saltRounds = 12;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        const admin = await Admin.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).select('-password');
        
        return { message: "Admin updated successfully", success: true, data: admin };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const getAllAdmins = async (page: number = 1, limit: number = 10) => {
    try {
        await ConnectDb();
        const skip = (page - 1) * limit;
        
        const admins = await Admin.find({ isActive: true })
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await Admin.countDocuments({ isActive: true });
        
        return { 
            message: "Admins fetched successfully", 
            success: true, 
            data: {
                admins,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const deleteAdmin = async (id: string) => {
    try {
        await ConnectDb();
        const admin = await Admin.findByIdAndUpdate(
            id, 
            { isActive: false }, 
            { new: true }
        ).select('-password');
        
        return { message: "Admin deleted successfully", success: true, data: admin };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
};

export const sendAdminOTP = async (email: string, currentPassword: string) => {
    try {
        await ConnectDb();
        
        // Verify admin exists and password is correct
        const admin = await Admin.findOne({ email: email, isActive: true });
        
        if (!admin) {
            return { message: "Admin not found", success: false };
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        
        if (!isPasswordValid) {
            return { message: "Invalid current password", success: false };
        }

        // Generate OTP
        const redisClient = setConnectionRedis();
        redisClient.connect(() => {
            console.log("Connected to Redis successfully for Admin OTP");
        });
        redisClient.on("error", (err) => {
            console.error("Redis connection error:", err);
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `admin_otp_${email}`;
        
        // Store OTP in Redis with 5 minute expiry
        await redisClient.set(otpKey, otp, "EX", 300);
        
        // Send OTP email
        const emailResult = await sendOtpEmail(admin.name, email, otp);
        
        if (emailResult.success === false) {
            return { 
                success: false, 
                message: "Failed to send OTP email, we are experiencing SMTP issues", 
                error: emailResult.error 
            };
        }

        return { message: "OTP sent successfully to your email", success: true };
    } catch (error) {
        console.error("Error sending admin OTP:", error);
        return { message: "Internal Server Error", success: false, error };
    }
};

export const verifyAdminOTP = async (email: string, otp: string) => {
    try {
        const redisClient = setConnectionRedis();
        const otpKey = `admin_otp_${email}`;
        
        const storedOtp = await redisClient.get(otpKey);
        
        if (!storedOtp) {
            return { message: "OTP expired or not found", success: false };
        }
        
        if (storedOtp !== otp) {
            return { message: "Invalid OTP", success: false };
        }
        
        // Mark OTP as verified (store verification token)
        const verifyKey = `admin_otp_verified_${email}`;
        await redisClient.set(verifyKey, "verified", "EX", 600); // 10 minutes to change password
        
        return { message: "OTP verified successfully", success: true };
    } catch (error) {
        console.error("Error verifying admin OTP:", error);
        return { message: "Internal Server Error", success: false, error };
    }
};

export const changeAdminPassword = async (email: string, otp: string, newPassword: string) => {
    try {
        await ConnectDb();
        
        // Verify OTP one more time
        const redisClient = setConnectionRedis();
        const verifyKey = `admin_otp_verified_${email}`;
        const otpKey = `admin_otp_${email}`;
        
        const isVerified = await redisClient.get(verifyKey);
        const storedOtp = await redisClient.get(otpKey);
        
        if (!isVerified || storedOtp !== otp) {
            return { message: "Invalid or expired OTP. Please request a new one.", success: false };
        }
        
        // Find admin
        const admin = await Admin.findOne({ email: email, isActive: true });
        
        if (!admin) {
            return { message: "Admin not found", success: false };
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        admin.password = hashedPassword;
        await admin.save();
        
        // Clean up Redis keys
        await redisClient.del(otpKey);
        await redisClient.del(verifyKey);
        
        return { message: "Password changed successfully", success: true };
    } catch (error) {
        console.error("Error changing admin password:", error);
        return { message: "Internal Server Error", success: false, error };
    }
};