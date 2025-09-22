import { getSession, updateSession } from '../controller/sessionController.js';
import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
const Router=express.Router();

Router.get('/:roomId', auth, getSession);
Router.put('/:roomId', auth, updateSession);
export default Router;
