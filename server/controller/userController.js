import User from "../models/User.js";

export const updateProfile= async(req,res)=>{
    try{
       const userId=req.user.id;
       const { profile, avatar } = req.body;  // Also destructure avatar
       console.log('Profile update request:', { profile, hasAvatar: !!avatar });
       
       if (!profile) {
           return res.status(400).json({ message: "Profile data is required" });
       }

       const user = await User.findById(userId);
       if (!user) {
           return res.status(404).json({ message: "User not found" });
       }

       // Update profile fields
       user.profile = profile;
       
       // Update avatar if provided
       if (avatar) {
           user.avatar = avatar;
       }
       
       console.log('Updated user profile:', user.profile);
       console.log('Updated user avatar:', user.avatar ? 'Updated' : 'No change');
       
       await user.save();
       
       return res.status(200).json({
           message: "Profile updated successfully", 
           profile: user.profile,
           avatar: user.avatar  // Send back the avatar too
       });
    }
    catch(err){
        console.log("Update user profile error:", err);
        return res.status(500).json({message:"Server Error"});
    }
}