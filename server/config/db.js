import { mongoose } from "mongoose";
const mongoURI = process.env.MONGODB_URI;

const connectDb = async () => {
    try{
        await mongoose.connect(mongoURI)
            console.log("MongoDb connected")
    }catch(err){
        console.log("Failed to connect MongoDb");
      process.exit(1);
    }
};
export default connectDb;
