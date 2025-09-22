import Session from "../models/Session.js";
import Room from "../models/Room.js";


export const getSession = async (req, res) => {
    try{
        const { roomId } = req.params;
        if (!roomId) {
            return res.status(400).json({ message: "RoomId is required" });
    }

    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
    }
    const room = await Room.findById(roomId);
    if (!room) {
        return res.status(404).json({ message: "Room Not Found" });
    }
    const isMember = room.participants.some(p => p.userId.toString() === userId.toString());
    if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this room" });
    }
    let session = await Session.findOne({ roomId});
    if (!session) {
        session = await Session.create({
            roomId,
            content: "",
            language: "javascript",
            updatedBy: userId
        });
        }
        return res.status(200).json({
            roomId,
            content:session.content,
            language:session.language,
            updatedBy:session.updatedBy,
            updatedAt:session.updatedAt,
             });
    }catch(err){
        console.error("Error in getSession:", err.message);
        console.error("Stack trace:", err.stack);
        return res.status(500).json({ 
            message: "Error retrieving session",
            error: err.message,
            code: err.code
        });
    }
};

export const updateSession=async(req,res)=>{
  try{
    const {roomId}=req.params;
    const {content,language}=req.body;
    if(!roomId || typeof content!=="string"){
        return res.status(400).json({ message: "All fields are required" });
    }
    const userId=req.user.id;
    if(!userId){
        return res.status(400).json({ message: "UserId is required" });
    }
    const room= await Room.findById(roomId);
    if(!room){
        return res.status(404).json({ message: "Room Not Found" });
    }

    let session= await Session.findOne({roomId});
    if(!session){
        session= await Session.create({roomId,content,language,updatedBy:userId});
    }
    else{
        session.content=content;
        if(language) session.language=language;
        if(userId) session.updatedBy=userId;
        await session.save();
        return res.status(200).json({
            roomId,
            content: session.content,
            language: session.language,
            updatedBy: session.updatedBy,
            updatedAt: session.updatedAt
        });
    }
  }catch(err){
    console.log("update Session error", err);
    return res.status(500).json({ message: "Error updating session", error: err.message });
    return res.status(500).json({ message: "Server Error" });
  }
}