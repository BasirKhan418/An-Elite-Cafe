import jwt from "jsonwebtoken";
export function verifyAdminToken(token: string) {
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        return { message: "Token is valid", success: true, user: decoded };
    }
    catch(err){
        return { message: "Invalid Token", success: false };
    }
}