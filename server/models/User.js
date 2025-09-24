import mongoose, { Schema } from "mongoose";

const profileSchema=new Schema({
    jobTitle: {
        type:String,
        maxlength:100,
        default:"",
    },
    company:{
        type:String,
        maxlength:100,
        default:"",
    },
    location:{
        type:String,
        maxlength:100,
        default:""
    },
    bio: {
        type:String,
        maxlength:500,
        default:"",
    }
},{_id:false}); // iska kaam hai ki ye profile schema ke andar _id field na banaye

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 10,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatar:{
        type:String,
    },
    roles: { type: [String], default: ["user"] },
    profile:{
        type:profileSchema, // means “every user will have a profile object (even if empty), shaped according to ProfileSchema.”
        default:{}
    },
    metadata:{
        type:Schema.Types.Mixed, // iske through hum koi bhi type ka data store kar sakte hain jaise ki object, array, string, number etc.
        default:{}, // default empty object
    }

}, { timestamp: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema); // the first part is like cache of already compiled models in mongoose, so if the model is already compiled, it will use that instead of recompiling it again which can cause errors in some cases.