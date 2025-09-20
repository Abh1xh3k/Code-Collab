import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
export default mongoose.model("Message", messageSchema);