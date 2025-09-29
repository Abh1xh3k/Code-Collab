import Room from "../models/Room.js";

export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id; // From auth middleware

    console.log(`getRoomDetails: roomId=${roomId}, userId=${userId}`);

    // Find the room
    const room = await Room.findById(roomId);
    
    if (!room) {
      console.log(`Room not found: ${roomId}`);
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    console.log(`Room found: ${room._id}, participants: ${room.participants}`);
    console.log(`Checking if userId ${userId} is in participants array`);

    // Check if user is a participant of the room
    if (!room.participants || !room.participants.some(participant => participant.userId.toString() === userId.toString())) {
      console.log(`User ${userId} is not a participant of room ${roomId}`);
      console.log(`Room participants: ${JSON.stringify(room.participants)}`);
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this room",
        debug: {
          userId: userId,
          roomParticipants: room.participants,
          roomId: roomId
        }
      });
    }

    // Return room details
    res.status(200).json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        createdBy: room.createdBy,
        participants: room.participants,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error("Error getting room details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};