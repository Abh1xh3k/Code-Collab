import Room from "../models/Room.js";
import bcrypt from "bcryptjs"

export const joinroom= async(req,res)=>{
    try{

        const {roomId,joinCode}=req.body;
        if(!roomId ||!joinCode){
        return res.status(400).json({message:"RoomId and JoinCode required"})
    }

    const room = await Room.findById(roomId);
    if(!room){
        return res.status(404).json({message:"Room Not Found"});
    }
     if(!room){
        return socket.emit("error", "Room does not exist");
    }
    
    const isMatch=await bcrypt.compare(joinCode,room.joinCodeHash);
    if(!isMatch){
        return res.status(403).json({message:"Invalid Password"});
    }
    const alreadyParticipant=room.participants.some(
        (p)=>p.userId.toString()===req.user.id.toString()
    );
    if (alreadyParticipant){
        return res.status(200).json({message:"User already a member of this room"});
    }
    
    room.participants.push({userId:req.user.id, role:"member"});
    await room.save();
    res.status(200).json({message:"Joinded Room Successfully"});
}
catch(err){
    console.log("Error Joining Room",err);
    res.status(500).json({
        message:"server Error"
    })
}
}