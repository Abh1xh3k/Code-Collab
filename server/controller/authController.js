import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

export const signup=async(req,res)=>{
    try{

        const {username,email,password}=req.body;
        if(!username||!email||!password){
            return res.status(400).json({message:"Please enter all the fields"});
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
    res.status(200).json({token,user:{id:user._id,username:user.username,email:user.email,message:"Login Successfull"}});
    }catch(err){
        console.log(err);
        res.status(500).json({error:err.message})
    }
};
