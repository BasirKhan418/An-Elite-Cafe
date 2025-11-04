import ConnectDb from "../../middleware/connectdb";
import Employee from "../../models/Employee";

export const getAllEmployees = async () => {
    try {
        await ConnectDb();
        const employees = await Employee.find({}).sort({ createdAt: -1 });
        return { message: "Employees fetched successfully", success: true, data: employees };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
}

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

export const updateEmployee =async (email:string,updateData:any)=>{
    try{
        await ConnectDb();
        const employee=await Employee.findOneAndUpdate({email:email},updateData,{new:true});
        return { message: "Employee updated successfully", success: true, data: employee }; 
    }
    catch(err){
        return { message: "Internal Server Error", success: false, error: err };
    }
}

export const deleteEmployee = async (email: string) => {
    try {
        await ConnectDb();
        const employee = await Employee.findOneAndDelete({ email: email });
        if (!employee) {
            return { message: "Employee not found", success: false };
        }
        return { message: "Employee deleted successfully", success: true, data: employee };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
}

export const toggleEmployeeStatus = async (email: string) => {
    try {
        await ConnectDb();
        const employee = await Employee.findOne({ email: email });
        if (!employee) {
            return { message: "Employee not found", success: false };
        }
        employee.isActive = !employee.isActive;
        await employee.save();
        return { message: "Employee status updated successfully", success: true, data: employee };
    } catch (err) {
        return { message: "Internal Server Error", success: false, error: err };
    }
}