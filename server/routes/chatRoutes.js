import { getMessage, sendMessage } from "../controller/messageController.js";
import express from "express";
import { auth } from "../middleware/authMiddleware.js";

const router=express.Router();
router.post('/sendMessage', auth ,sendMessage);
router.get('/getMessage/:roomId',auth,getMessage);

export default router;
