import ConnectDb from "../../middleware/connectdb";
import Admin from "../../models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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