import express from "express";
import { createRoom } from "../controller/createRoom.js";
import { joinroom } from "../controller/joinRoom.js";
import{ auth} from '../middleware/authMiddleware.js';

const router=express.Router();
router.post('/create',auth,createRoom);
router.post('/join',auth,joinroom);

export default router;