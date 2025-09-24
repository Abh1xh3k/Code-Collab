import Room from "../models/Room.js";

export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id; // From auth middleware

    // Find the room
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Check if user is a member of the room
    if (!room.members || !room.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room"
      });
    }

    // Return room details
    res.status(200).json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        createdBy: room.createdBy,
        members: room.members,
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