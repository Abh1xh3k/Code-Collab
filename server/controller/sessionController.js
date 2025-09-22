import Session from "../models/Session";
import Room from "../models/Room";


export const SessionController = async (req, res) => {

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
    const isMember = room.participant.some(p => p.userId.toString() === userId.toString());
    if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this room" });
    }
    const Session = await Session.findOne({ roomId, userId });
    if (!Session) {
        const session = await session.create(
            {
                roomId,
                userId,
                language,
                updatedBy: userId
            });
        }
        else {
            Session.content = content;
            Session.updatedBy = userId;
            Session.language = language;
            await Session.save();
        }
        return res.status(200).json({ message: "saved", data: Session, updatedBy: userId });
    }catch(err){
        console.log("Error in Session Controller", err);
        return res.status(500).json({ message: "Server Error" });
    }

}