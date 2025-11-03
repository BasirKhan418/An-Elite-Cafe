import ConnectDb from "../../middleware/connectdb";
import Table from "../../models/Table";
import { TableStatus } from "../../models/Table";
export const updateTableStatus =async(tableid:string,status:string)=>{
    try{
        await ConnectDb();
        if(status===TableStatus.AVAILABLE || status===TableStatus.OCCUPIED || status===TableStatus.RESERVED){
            const table=await Table.findOneAndUpdate({tableid:tableid},{status:status},{new:true});
            return { message: "Table status updated successfully", success: true, table }; 
        }
        else{
            return { message: "Invalid status value", success: false };
        }
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}

export const createTable=async(tableData:any)=>{
    try{
        await ConnectDb();
        const table=await Table.create(tableData);
        return { message: "Table created successfully", success: true, data: table };
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}

export const deleteTable=async(tableid:string)=>{
    try{
        await ConnectDb();
        const table=await Table.findOneAndDelete({tableid:tableid});
        if(!table){
            return { message: "Table not found", success: false };
        }
        return { message: "Table deleted successfully", success: true, data: table };
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}