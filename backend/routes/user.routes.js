import express from 'express';
import {
    signUpUser,
    loginUser,
    logoutUser,
    getAllUsers,
    // deleteProfile,
    renameUser,
    emailUpdate,
    passwordUpdate,
    profilePicUpdate,
    deleteProfile
} from '../controllers/user.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { uploadFile } from '../multer/multer.config.js';


const router = express.Router();

router.post('/signup', uploadFile('profilePic'),signUpUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

router.route('/all-users').get(protectedRoute,getAllUsers);
router.route('/rename-user').put(protectedRoute,renameUser);
router.route('/emailUpdate').put(protectedRoute,emailUpdate);
router.route('/picUpdate').put(protectedRoute, uploadFile("profilePic"),profilePicUpdate);
router.route('/passwordUpdate').put(protectedRoute,passwordUpdate);

router.route('/del-profile').put(protectedRoute,deleteProfile);
export default router;