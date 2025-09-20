import mongoose ,{Schema} from "mongoose";
const SessionSchema= new Schema({
    roomId:{
       type:Schema.Types.ObjectId,
       ref:"room",
       required:true,
    },
    content:{
        type:String,
        required:true,
    },
    language:{
        type:String,
        default:"javascript",
    },
    updatedAt:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:false,
    }
},{timestamps:true});

export default mongoose.model("Session",SessionSchema);