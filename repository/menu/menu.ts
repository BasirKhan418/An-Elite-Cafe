import { success } from "zod";
import ConnectDb from "../../middleware/connectdb";
import Category from "../../models/Category";
import Menu from "../../models/Menu";
export const getAllMenus = async () => {
    await ConnectDb();
    const menu = await Menu.find({});
    return menu;
}
//
export const searchByCategoryId = async (categoryid: string) => {
    try{
    await ConnectDb();
    const menus = await Menu.find({category: categoryid});
    return {success:true,menus,message:"Menus fetched successfully" };
    }
    catch(error){
        return {success:false,error,message:"Failed to fetch menus"};
    }
}
//serach by status and categoryid
export const filterByStatusAndCategoryId = async (categoryid: string, status: string) => {
    try{
    await ConnectDb();
    const menus = await Menu.find({category: categoryid, status: status});
    return {success:true,menus,message:"Menus fetched successfully" };
    }
    catch(error){
        return {success:false,error,message:"Failed to fetch menus"};
    }
}
//search by categoryid and search term
export const searchByCategoryIdAndTerm = async (
  categoryid: string,
  searchTerm: string,
  status: string
) => {
  try {
    await ConnectDb();

    const query: any = {
      category: categoryid,
      status: status,
    };
    if (searchTerm && searchTerm.trim() !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const menus = await Menu.find(query);
    return { success: true, menus, message: "Menus fetched successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error, message: "Failed to fetch menus" };
  }
};


export const createMenu = async (data: any) => {
    try{
        await ConnectDb();
    const menu = new Menu(data);
    await menu.save();
    return {success:true,menu,message:"Menu created successfully"};
    }
    catch(error){
        return {success:false,error,message:"Failed to create menu"};
    }
    
}

export const updateMenu = async (menuid: string, data: any) => {
    try{
        await ConnectDb();
    const updatedMenu = await Menu.findOneAndUpdate({menuid}, data, {new:true});
    return {success:true,menu:updatedMenu,message:"Menu updated successfully"};
    }
    catch(error){
        return {success:false,error,message:"Failed to update menu"};
    }
}

export const deleteMenu = async (menuid: string) => {
    try{
        await ConnectDb();
        const data =await Menu.findOne({menuid});
    if(!data){
        return {success:false,message:"Menu not found"};
    }
    await Menu.deleteMany({category: data._id});
    const deletedMenu = await Menu.findOneAndDelete({menuid});
    //check for menu items associated with this menu and handle them accordingly (e.g., delete or reassign)
    return {success:true,menu:deletedMenu,message:"Menu deleted successfully"};
    }
    catch(error){
        return {success:false,error,message:"Failed to delete menu"};
    }
}
