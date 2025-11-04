import { success } from "zod";
import ConnectDb from "../../middleware/connectdb";
import Category from "../../models/Category";
import Menu from "../../models/Menu";
export const getAllCategories = async () => {
    await ConnectDb();
    const categories = await Category.find({});
    return categories;
}

export const createCategory = async (data: any) => {
    try{
        await ConnectDb();
    const category = new Category(data);
    await category.save();
    return {success:true,category,message:"Category created successfully"};
    }
    catch(error){
        return {success:false,error,message:"Failed to create category"};
    }
    
}

export const updateCategory = async (categoryid: string, data: any) => {
    try{
        await ConnectDb();
    const updatedCategory = await Category.findOneAndUpdate({categoryid}, data, {new:true});
    return {success:true,category:updatedCategory,message:"Category updated successfully"};
    }
    catch(error){
        return {success:false,error,message:"Failed to update category"};
    }
}

export const deleteCategory = async (categoryid: string) => {
    try{
        await ConnectDb();
        const data =await Category.findOne({categoryid});
    if(!data){
        return {success:false,message:"Category not found"};
    }
    await Menu.deleteMany({category: data._id});
    const deletedCategory = await Category.findOneAndDelete({categoryid});
    //check for menu items associated with this category and handle them accordingly (e.g., delete or reassign)
    return {success:true,category:deletedCategory,message:"Category deleted successfully"};
    }
    catch(error){
        return {success:false,error,message:"Failed to delete category"};
    }
}
