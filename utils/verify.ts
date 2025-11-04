import jwt from "jsonwebtoken";

export function verifyAdminToken(authHeader: string) {
    try {
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;
            
        if (!token) {
            return { message: "No token provided", success: false };
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        return { message: "Token is valid", success: true, user: decoded };
    } catch (err) {
        console.error('Token verification error:', err);
        return { message: "Invalid token", success: false };
    }
}
