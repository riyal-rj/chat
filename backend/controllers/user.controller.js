import User from "../models/User.model.js";
import bcrypt from 'bcryptjs';
import { generateAndSetCookie } from "../utils/generateAndSetCookie.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.js";
import Chat from "../models/Chat.Model.js";
import Message from "../models/Message.Model.js";


export const signUpUser = async (req, res, next) => {
    const { email, password, username } = req.body;
    try {
        if (!email || !username || !password) {
            return res.status(400).json({
                status: false,
                message: 'All fields are mandatory'
            });
        }

        const isEmailExists = await User.findOne({ email: email });
        if (isEmailExists) {
            return res.status(400).json({
                status: false,
                message: "Email ID already exists! Please enter a non-logged in Email ID"
            });
        }

        const isUsernameExists = await User.findOne({ username: username });
        if (isUsernameExists) {
            return res.status(400).json({
                status: false,
                message: "Username already exists! Please enter a non-logged in username"
            });
        }
        const profilePic = (req.file) ? req.file.originalname : "default.jpg";
        const passcodeRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passcodeRegex.test(password)) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.',
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            profilePic: profilePic,
        });

        generateAndSetCookie(res, newUser._id);

        await newUser.save();

        res.status(201).json({
            status: true,
            message: 'User successfully registered!',
            token: req.cookies['jwt'] || req.headers.authorization?.split(' ')[1],
            user: {
                ...newUser._doc,
                password: undefined,
                isAdmin: newUser.isAdmin
            }
        });
    } catch (error) {
        console.log('Error in signup constroller: ', error.message);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}


export const loginUser = async (req, res, next) => {
    const { emailOrusername, password } = req.body;
    try {
        if (!emailOrusername || !password) {
            return res.status(400).json({
                status: false,
                message: 'All fields are mandatory!'
            });
        }

        const user = await User.findOne({
            $or: [
                { email: emailOrusername },
                { username: emailOrusername }
            ]
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'Invalid credentials entered or User details do not exist'
            });
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({
                status: false,
                message: 'User have entered wrong password'
            });
        }

        generateAndSetCookie(res, user._id);

        res.status(200).json({
            status: true,
            message: 'User logged in successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        console.log('Error in login constroller: ', error.message);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}


export const logoutUser = async (req, res, next) => {
    try {
        const jwtToken = req.cookies.jwt;

        if (!jwtToken) {
            return res.status(400).json({
                status: false,
                message: 'Already logged out!'
            });
        }

        const decoded = jwt.verify(jwtToken, ENV_VARS.JWT_SECRET);

        const user = await User.findById(decoded.id).select("username");

        res.cookie("jwt", "", { maxAge: 0 });

        res.status(200).json({
            status: true,
            message: `${user?.username || "User"} logged out successfully`
        });

    } catch (error) {
        console.log('Error in logout constroller: ', error.message);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const keyword = req.query.search
            ? { username: { $regex: req.query.search, $options: "i" } }
            : {};
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        res.send(users);
    } catch (error) {
        console.log('Error in getAllUsers constroller: ', error.message);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error!',
            error: error.message
        })
    }
}

export const renameUser = async (req, res, next) => {
    try {
        const { newUsername } = req.body;

        if (!newUsername) {
            return res.status(400).json({
                status: false,
                message: 'New username is required!',
            });
        }

        const userId = req.user._id;
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            return res.status(400).json({
                status: false,
                message: 'Username is already used'
            });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found!',
            });
        }
        user.username = newUsername;
        await user.save();

        res.status(200).json({
            status: true,
            message: 'Username updated successfully!',
            user,
        });
    } catch (error) {
        console.log(`Error in renameUser controller: `, error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message
        });
    }
}

export const emailUpdate = async (req, res, next) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({
                status: false,
                message: 'New email id is required!',
            });
        }

        const userId = req.user._id;
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            return res.status(400).json({
                status: false,
                message: 'Email Id is already used'
            });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found!',
            });
        }
        user.email = newEmail;
        await user.save();

        res.status(200).json({
            status: true,
            message: 'Email ID updated successfully!',
            user,
        });
    } catch (error) {
        console.log(`Error in updateEmail controller: `, error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message
        });
    }
}

export const passwordUpdate = async (req, res, next) => {
    const { currPassword, newPassword } = req.body;
    try {
        if (!currPassword || !newPassword) {
            return res.status(400).json({
                status: false,
                message: 'Current password and new password is required.'
            })
        }

        const userId = req.user._id;
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(currPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: 'Current Password is incorrect'
            })
        }

        const passcodeRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passcodeRegex.test(newPassword)) {
            return res.status(400).json({
                status: false,
                message:
                    'New password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.',
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: true,
            message: 'Password Changed successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        console.log(`Error in passwordUpdate controller: `, error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message
        });
    }

}

export const profilePicUpdate = async (req, res, next) => {
    try {
        const profilePhoto = req.file ? req.file.originalname : "default.jpg";
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found!"
            });
        }

        user.profilePic = profilePhoto;
        await user.save();

        res.status(200).json({
            status: true,
            message: 'Profile photo updated successfully!',
        });
    } catch (error) {
        console.log('Error in profilePhotoUpdate controller: ', error.message);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error!',
            error: error.message,
        });
    }
}

export const deleteProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found!'
            });
        }

        const adminGroupChats = await Chat.find({
            groupAdmin: userId,
            isGroupChat: true
        });

        if (adminGroupChats.length > 0) {
            await Chat.deleteMany({
                groupAdmin: userId,
                isGroupChat: true
            });
            await Message.deleteMany({
                chat: { $in: adminGroupChats.map(chat => chat._id) }
            });
        }

        const nonAdminGroupChats = await Chat.find({
            users: { $elemMatch: { $eq: userId } },
            groupAdmin: { $ne: userId },
            isGroupChat: true
        });

        if (nonAdminGroupChats.length > 0) {
            await Chat.updateMany(
                {
                    _id: { $in: nonAdminGroupChats.map(chat => chat._id) }
                },
                {
                    $pull: { users: userId }
                }
            );
        }

        const onetTooneChats = await Chat.find({
            users: { $elemMatch: { $eq: userId } },
            isGroupChat: false
        });

        if (onetTooneChats.length > 0) {
            await Chat.deleteMany({
                _id: { $in: onetTooneChats.map(chat => chat._id) }
            });

            await Message.deleteMany({
                chat:{$in:onetTooneChats.map(chat=>chat._id)}
            });
        }

        await User.deleteOne({_id:userId});
        return res.status(200).json({
            status:true,
            message:`User profile and associated chats deleted successfully!`,
            details:{
                goupChatsDeleted:adminGroupChats.length,
                groupChatsRemoved:nonAdminGroupChats.length,
                onetTooneChatsDeleted:onetTooneChats.length
            }
        });

    } catch (error) {
        console.error("Error in deleteProfile controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message
        });
    }
}