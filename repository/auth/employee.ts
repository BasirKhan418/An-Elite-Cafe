import ConnectDb from "../../middleware/connectdb";
import Employee from "../../models/Employee";
export const createEmployee=async (employeeData:any)=>{
    try{
        await ConnectDb();
        const employee=await Employee.create(employeeData);
        return { message: "Employee created successfully", success: true, data: employee };
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}

export const getEmployeeByEmail=async (email:string)=>{
    try{
        await ConnectDb();
        const employee=await Employee.findOne({email:email});
        return { message: "Employee fetched successfully", success: true, data: employee };
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}