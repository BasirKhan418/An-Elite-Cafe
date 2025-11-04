import ConnectDb from "../../middleware/connectdb";
import Table from "../../models/Table";
import { TableStatus } from "../../models/Table";
export const changeTableStatus = async (tableid: string, status: string) => {
    try{
        await ConnectDb();
        const validStatuses = Object.values(TableStatus);
        if (!validStatuses.includes(status as TableStatus)) {
            return { success: false, message: "Invalid table status" };
        }
        const updatedTable = await Table.findOneAndUpdate({tableid}, {status: status}, {new: true});
        if (!updatedTable) {
            return { success: false, message: "Table not found" };
        }
        return { success: true, table: updatedTable };
    }
    catch(error){
        return { success: false, error, message: "Failed to change table status" };
    }
}