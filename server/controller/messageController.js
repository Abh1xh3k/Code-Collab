import Message from "../models/Message.js";
import Room from "../models/Room.js";

export const sendMessage= async(req,res)=>{
    try{
        const{roomId,text}=req.body;
        console.log(req.body);
        if(!roomId||!text){
            return res.status(404).json({message:"RoomId and Text required"});
        }
        const userId=req.user.id;
        console.log(userId);
        const room= await Room.findById(roomId);
        if(!room){
            return res.status(404).json({message:"Room Not Found"});
        }
      const message= await Message.create({
        roomId,
        userId,
        text
      })
      res.status(201).json({message:"Message Sent successfully",data:message});
    }catch(err){
      console.log("Error Sending Message",err);
      res.status(500).json({Message:"Server Error"});
    }
}

export const getMessage=async(req,res)=>{
    try{
        const {roomId}=req.params; //req.params is used to get the parameters from the url
        if(!roomId){
            return res.status(400).json({message:"RoomId is required"});
        }
        const room=await Room.findById(roomId);
        if(!room){
            return res.status(404).json({message:"Room Not Found"});
        }
        const message=await Message.find({roomId}).populate("userId","username email").sort({createdAt:1}).limit(50); // it is doing populate userId field with username and email from User model
        res.status(200).json({messages:message});
    }
    catch(err){
        console.log("Error Getting Messages",err);
        res.status(500).json({message:"Server Error"});
    }
}