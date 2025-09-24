import Room from "../models/Room.js";
import User from "../models/User.js";

export const leaveRoom = async (req, res) => {
    try {

        const userId = req.user.id;
        const { roomId } = req.params;
        if (!roomId) {
            return res.status(404).json({ message: "RoomId is required" });
        }
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        const isMember = room.participants.find(p => p.userId.toString() === userId.toString());
        if (!isMember) {
            return res.status(404).json({ message: "User not the member of room" });
        }

        room.participants = room.participants.filter(
            (p) => p.userId.toString() !== userId.toString()
        );
        await room.save();
        return res.status(200).json({ message: "Left the room successfully" });
    } catch (err) {
        console.log("Leave room error", err);
        return res.status(500).json({ message: "Server Error" });
    }
}