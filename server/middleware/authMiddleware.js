import jwt from "jsonwebtoken";

export const auth=(req,res,next)=>{
    try{
        // Check both cookies and Authorization header
        let token = req.cookies.authToken;
        
        if (!token && req.headers.authorization) {
            // Extract token from "Bearer <token>" format
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        console.log(`Auth middleware: token source=${req.cookies.authToken ? 'cookie' : req.headers.authorization ? 'header' : 'none'}`);
        console.log(`Auth middleware: token=${token ? 'exists' : 'missing'}`);
        
        if (!token) {
            return res.status(401).json({message:"No token provided"});
        }
        
        const decode=jwt.verify(token, process.env.JWT_SECRET || "abhi123");
        console.log(`Auth middleware: decoded user id=${decode.id}`);
        
        req.user={id:decode.id};
        next();
    }catch(error){
        console.log(`Auth middleware error: ${error.message}`);
        res.status(401).json({message:"Unauthorized", error: error.message});
    }
};
