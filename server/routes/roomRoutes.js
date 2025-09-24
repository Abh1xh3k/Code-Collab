import express from "express";
import { createRoom } from "../controller/createRoom.js";
import { joinroom } from "../controller/joinRoom.js";
import{ auth} from '../middleware/authMiddleware.js';
import { leaveRoom } from "../controller/leaveRoom.js";
import { getRoomDetails } from "../controller/getRoomDetails.js";


const router=express.Router();
router.post('/create',auth,createRoom);
router.post('/join',auth,joinroom);
router.delete('/leave/:roomId',auth,leaveRoom);
router.get('/:roomId',auth,getRoomDetails);

export default router;