import User from "../models/User.js";

export const updateProfile= async(req,res)=>{
    try{
       const userId=req.user.id;
       const { profile } = req.body;  // Destructure profile from req.body
       console.log(profile);
       
       if (!profile) {
           return res.status(400).json({ message: "Profile data is required" });
       }

       const user = await User.findById(userId);
       if (!user) {
           return res.status(404).json({ message: "User not found" });
       }

       user.profile = profile;
       console.log(user.profile);
       await user.save();
       return res.status(200).json({message:"Profile updated successfully", profile:user.profile});
    }
    catch(err){
        console.log("get user profile error", err);
        return res.status(500).json({message:"Server Error"});
    }
}