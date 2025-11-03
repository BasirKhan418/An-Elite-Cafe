import ConnectDb from "../../middleware/connectdb";
import Table from "../../models/Table";
import { TableStatus } from "../../models/Table";
export const fetchAllTable=async()=>{
try{
    await ConnectDb();
    const tables=await Table.find({});
    return { message: "Tables fetched successfully", success: true, tables };
}
catch(err){
    return { message: "Internal Server Error", success: false, error: err };
}
}

export const fetchTablesByStatus=async(status:string)=>{
    try{
        await ConnectDb();
        if(status===TableStatus.AVAILABLE){
            const tables=await Table.find({status:TableStatus.AVAILABLE});
            return { message: "Available tables fetched successfully", success: true, tables };
        }
        else if(status===TableStatus.OCCUPIED){
            const tables=await Table.find({status:TableStatus.OCCUPIED});
            return { message: "Occupied tables fetched successfully", success: true, tables };
        }
        else if(status===TableStatus.RESERVED){
            const tables=await Table.find({status:TableStatus.RESERVED});
            return { message: "Reserved tables fetched successfully", success: true, tables };
        }
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}