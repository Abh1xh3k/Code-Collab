import mongoose from "mongoose";
import 'dotenv/config';

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/CodeCollab";

const connectDb = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
        return true;
    } catch(err) {
        console.error("Failed to connect MongoDB:", err.message);
        process.exit(1);
    }
};

// If this file is run directly, execute the connection
if (process.argv[1] === new URL(import.meta.url).pathname) {
    connectDb();
}

export default connectDb;
