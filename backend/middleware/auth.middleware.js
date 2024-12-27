import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { ENV_VARS } from '../config/envVars.js';

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized Access! No Token provided"
            })
        }

        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized Access! No Token provided"
            });
        }

        const user=await User.findById(decoded.id);
        if(!user)
        {
            return res.status(401).json({
                status:false,
                message:"Unauthorized Access! No Token provided"
            });
        }

        req.user=user;
        next();
    } catch (error) {
        console.log('Error in auth moiddleware: ', error.message);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}