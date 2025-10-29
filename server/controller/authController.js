import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

export const signup=async(req,res)=>{
    try{

        const {username,email,password}=req.body;
        if(!username||!email||!password){
            return res.status(400).json({message:"Please enter all the fields"});
        }

        if (username.includes(' ')) {
            return res.status(400).json({message:"Username cannot contain spaces"});
        }
        if (username.length > 20) {
            return res.status(400).json({message:"Username must be 20 characters or less"});
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return res.status(400).json({message:"Username can only contain letters, numbers, underscores, and hyphens"});
        }

        const exist = await User.findOne({
      $or: [{ username }, { email }],
    });
   if(exist){
       return res.status(400).json({message:"Username already exist"});
   }
   const user=await User.create({
       username,
       email,
       password:bcrypt.hashSync(password,10)
    })
       const token=generateToken(user._id); //user._id milegi from mongodb uska to ye function call hoke token generate karega
       return  res.status(201).json({token,user:{id:user._id,username:user.username,email:user.email}});//iska kaam hoga front end pe user ko identify karna
    }catch(err){
        console.log(err);
        return  res.status(500).json({message:"Server Error"});
    }
};

export const login=async(req,res)=>{
    try{
        const {username,password}=req.body;
        if(!username|| !password){
            res.status(400).json({message:"please enter all the fields"});
        }
    const user=await User.findOne({username});
    if(!user){
        return res.status(400).json({message:"User does not exist"});
    }
    if(!bcrypt.compareSync(password,user.password)){
        return res.status(400).json({message:"Inavlid Credential"});
    }
    const token=generateToken(user._id);
    res.cookie('authToken',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"None",
        maxAge:7*24*60*60*1000, // 7 days in milliseconds
    })
     return res.status(200).json({token,user:{id:user._id,username:user.username,email:user.email,message:"Login Successfull"}});
    }catch(err){
        console.log(err);
        res.status(500).json({error:err.message})
    }
};
export const logout=async(req,res)=>{
    try{

        res.clearCookie('authToken');
        return res.status(200).json({message:"Logout Successfull"});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}
