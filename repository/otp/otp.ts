import Employee from "../../models/Employee";
import ConnectDb from "../../middleware/connectdb";
import setConnectionRedis from "../../middleware/connectRedis";
import { sendOtpEmail } from "../../email/SendOtp";
import jwt from "jsonwebtoken";
export const createOTPEntry=async (email:string)=>{
    try{
        await ConnectDb();
        const redisClient = setConnectionRedis();
        redisClient.connect(() => {
            console.log("Connected to Redis successfully for OTP");
        });
        redisClient.on("error", (err) => {
            console.error("Redis connection error:", err);
        });
        
        const checkuser = await Employee.findOne({ email: email });
        if(!checkuser){
            return { message: "Employee not found", success: false };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // use ioredis-style arguments for EX to satisfy typings
        await redisClient.set(email, otp, "EX", 300); // OTP valid for 5 minutes
        const data = await sendOtpEmail(checkuser.name, email, otp);
        if(data.success===false){
            return {success:false,message:"Failed to send OTP email, we are experiencing smtp issues",error:data.error};
        }

        return { message: "OTP sent successfully", success: true,  };
    }
    catch (error) {
        return { success: false, error };
    }
}

export const verifyOTPEntry=async (email:string,otp:string)=>{
    try{
        const redisClient = setConnectionRedis();
        console.log("Verifying OTP for email:", email, "with OTP:", otp); // Debugging line
        const storedOtp = await redisClient.get(email);
        console.log("Stored OTP:", storedOtp); // Debugging line
        if (!storedOtp) {
            return { message: "OTP expired or not found", success: false };
        }
        if (storedOtp !== otp) {
            return { message: "Invalid OTP", success: false };
        }
        await redisClient.del(email);
        const token = jwt.sign({ email }, process.env.JWT_SECRET || "");
        return { message: "OTP verified successfully", success: true, token };
    }
    catch (error) {
        return { success: false, error };
    }
}