import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { accessNdmakeChats, createGroupChat, fetchChats , renameGroup, removeFromGroup, addToGroup, updateGroupProfilePic, deleteChat} from '../controllers/chat.controller.js';
import { uploadFile } from '../multer/multer.config.js';

const router =express.Router();

router.route('/access-chat').post(protectedRoute,accessNdmakeChats);
router.route('/fetch-chat').get(protectedRoute,fetchChats);


router.route('/createGrp').post(protectedRoute,createGroupChat);
router.route('/rnmGrp').put(protectedRoute,renameGroup);
router.route('/updtGrpPic').put(protectedRoute,uploadFile("groupPic"),updateGroupProfilePic);

router.route('/del-Chat').put(protectedRoute,deleteChat);

//admin only operations
router.route('/rmvFromGrp').put(protectedRoute,removeFromGroup);
router.route('/addToGrp').put(protectedRoute,addToGroup);
export default router;