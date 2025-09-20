import { mongoose } from "mongoose";
const mongoURI="mongodb://localhost:27017/CodeCollab";


const connectDb=async()=>{
    try{
        await mongoose.connect(mongoURI)
            console.log("MongoDb connected")
    }catch(err){
        console.log("Failed to connect MongoDb");
      process.exit(1);
    }
};
export default connectDb;
