import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';
export const generateAndSetCookie=(res,id)=>{
    const jwtToken=jwt.sign(
        {id},
        ENV_VARS.JWT_SECRET,
        {
            expiresIn:'3d',
        }
    );

    res.cookie(
        'jwt',
        jwtToken,
        {
            httpOnly:true, //accesible thorugh browser and not  js 
            maxAge:3*24*60*60*1000, // 1day in milliseconds
            secure:ENV_VARS.NODE_ENV !== 'development',
            sameSite:"strict" //to prevent cross-site request forgery
        }
    )

    return jwtToken;
}