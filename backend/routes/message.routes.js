import express from 'express';
import {protectedRoute} from './../middleware/auth.middleware.js';
import {uploadFile} from './../multer/multer.config.js';

import {getAllMessage, sendMessage} from '../controllers/message.controller.js';

const router=express.Router();
router.route('/sndMsg').put(protectedRoute,uploadFile("attachment"),sendMessage);
router.route('/getMsg/:chatId').get(protectedRoute,getAllMessage);

export default router;