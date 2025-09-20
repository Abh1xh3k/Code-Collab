import jwt from "jsonwebtoken";

export const auth=(req,res,next)=>{
    try{
        const token= req.header("Authorization")?.replace("Bearer ","");
            const decode=jwt.verify(token, process.env.JWT_SECRET || "abhi123"); // Remove the dot after token
            req.user={id:decode.id};
            next();
    }catch{
      res.status(401).json({message:"Unauthorized"});
    }
};
