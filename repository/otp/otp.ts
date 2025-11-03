import Employee from "../../models/Employee";
import ConnectDb from "../../middleware/connectdb";
import setConnectionRedis from "../../middleware/connectRedis";
import { sendOtpEmail } from "../../email/SendOtp";
export const createOTPEntry=async (email:string)=>{
    try{
        await ConnectDb();
        const redisClient = await setConnectionRedis();
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