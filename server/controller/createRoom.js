import Room from "../models/Room.js";
import bcrypt from "bcryptjs";
export const createRoom=async(req,res)=>{
    try{
        const {name,isPrivate=true,joinCode}=req.body;
      console.log(req.body);

       if (!name || typeof isPrivate !== "boolean" || !joinCode) {
  return res.status(400).json({ message: "Required Missing Field" });
}


        const hash=  joinCode?await bcrypt.hash(joinCode,10):null;

        const room = await Room.create({
            name,
            isPrivate:isPrivate,
            joinCodeHash:hash,
            participants:[{userId:req.user.id,role:"admin"}]
        })
        
        res.status(201).json({
            message:"Room Created Succeffully",
            room:room._id
        });
    }catch(err){
        console.log("Error Creating Room", err);
        res.status(500).json({
            message:"server error"
        })
    }
}