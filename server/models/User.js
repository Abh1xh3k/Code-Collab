import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlenght: 3,
        maxlenght: 10,
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
        minlenght: 6,
    },
}, { timestamp: true },
);

export default mongoose.model("User", userSchema);