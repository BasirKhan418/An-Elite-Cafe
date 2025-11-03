import { NextResponse,NextRequest } from "next/server";
import ConnectDb from "../../../../../../middleware/connectdb";
import setConnectionRedis from "../../../../../../middleware/connectRedis";
export const POST = async (request: NextRequest) => {
    try{
        await ConnectDb();
        const redisClient = await setConnectionRedis();
        return NextResponse.json({message:"Database connected successfully"});
    }
    catch(err){
        return NextResponse.json({message:"Internal Server Error",error:err});
    }
}