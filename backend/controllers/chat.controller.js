import Chat from '../models/Chat.Model.js';
import Message from '../models/Message.Model.js';
import User from "../models/User.model.js";



export const fetchChats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        let chats = await Chat.find({
            users: {
                $elemMatch: {
                    $eq: userId
                }
            }
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        chats = await User.populate(
            chats,
            {
                path: "latestMessage,sender",
                select: "username profilePic"
            }
        );

        chats = chats.map((chat) => {
            if (!chat.isGroupChat) {
                // Find the other user in the chat
                const otherUser = chat.users.find(
                    (user) => user._id.toString() !== userId.toString()
                );
                chat.chatName = otherUser ? otherUser.username : "Unknown User";
            }
            return chat;
        });

        res.status(200).json({
            status: true,
            message: "Chats fetched sucessfully",
            chats: chats
        })
    } catch (error) {
        console.error("Error in fetchChats controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}

export const accessNdmakeChats = async (req, res, next) => {
    const { friendId } = req.body;
    try {
        const userId = req.user._id;
        if (!friendId) {
            return res.status(400), json({
                status: false,
                message: "No FriendId provided! FriendId is required "
            });
        }

        let hadChatted = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: userId } } },  //logged in user is there in the database or not
                { users: { $elemMatch: { $eq: friendId } } }  //Friend 
            ]
        })
            .populate("users", "-password")
            .populate("latestMessage");

        hadChatted = await User.populate(hadChatted, {
            path: "latestMessage.sender",
            select: "username profilePic"
        });

        if (hadChatted.length > 0) {
            return res.status(200).json({
                status: true,
                message: "Chat retrieved successfully!",
                chat: hadChatted[0],
            });
        }

        const friend = await User.findById({ _id: friendId })
        if (!friend) {
            return res.status(404).json({
                status: false,
                message: "Friend not found!",
            });
        }

        const chatName = [userId, friendId].sort()
            .map(id => id === userId ? req.user.username :
                friend.username).join(" & ");

        const createdChat = new Chat({
            chatName: chatName,
            isGroupChat: false,
            groupPic: "",
            users: [userId, friendId],
        });
        await createdChat.save();

        const fullChat = await Chat.findById(createdChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage");

        res.status(200).json({
            status: true,
            message: "Chat created successfully!",
            chat: fullChat,
        });

    } catch (error) {
        console.log("Error in accessChat controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}

export const createGroupChat = async (req, res, next) => {
    try {
        const { users: rawUsers, name: groupName } = req.body;

        if (!rawUsers || !groupName) {
            return res.status(400).json({
                status: false,
                message: 'Please fill all th required fields'
            });
        }

        const defaultGroupPic = "default-group.jpg";

        //Parse the rawUsers
        let groupMembers = JSON.parse(rawUsers);

        //Ensure at least two users are present
        if (groupMembers.length < 1) {
            return res.status(400).json({
                status: false,
                message: 'At least two users are required to create a group chat!'
            });
        }
        //adding the logged in user 
        groupMembers.push(req.user);

        //Create the group chat
        const newGroupChat = await new Chat({
            chatName: groupName,
            users: groupMembers,
            isGroupChat: true,
            groupPic: defaultGroupPic,
            groupAdmin: req.user // logged in user who created is the admin
        });
        await newGroupChat.save();

        //Fetch the full details of the group chat
        const fullGroupChat = await Chat.findById(newGroupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({
            status: true,
            message: 'Group Chat created successfully!',
            chat: fullGroupChat
        });
    } catch (error) {
        console.error("Error in createGroupChat controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}
export const renameGroup = async (req, res, next) => {
    try {
        const { chatId: groupChatId, chatName: newGroupName } = req.body;

        if (!groupChatId || !newGroupName) {
            return res.status(400).json({
                status: false,
                message: 'GroupChat ID and newGroupName are required'
            });
        }

        const chat = await Chat.findById(groupChatId);
        if (!chat) {
            return res.status(404).json({
                status: false,
                message: "Chat not found!",
            });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({
                status: false,
                message: "This operation is only allowed for group chats"
            });
        }

        const isUserInGroup = chat.users.some(user => user._id.toString() === req.user._id.toString());
        if (!isUserInGroup) {
            return res.status(403).json({
                status: false,
                message: `You - ${req.user.username} is not authorized to update the group pic as you do not belong to the group!`
            });
        }

        const updateGroupChat = await Chat.findByIdAndUpdate(
            groupChatId,
            { chatName: newGroupName },
            { new: true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({
            status: true,
            message: `Group Chat renamed to ${updateGroupChat.chatName} Successfully by ${req.user.username} !`,
            chat: updateGroupChat
        })
    } catch (error) {
        console.error("Error in renameGroup controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}

export const removeFromGroup = async (req, res, next) => {
    try {
        const { chatId: groupChatId, userId } = req.body;

        if (!groupChatId || !userId) {
            return res.status(400).json({
                status: false,
                message: 'Chat ID and User ID are required to perform the operation'
            });
        }

        const chat = await Chat.findById(groupChatId);

        if (!chat) {
            return res.status(404).json({
                status: false,
                message: "Chat not Found"
            });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({
                status: false,
                message: "This operation is only allowed for group chats!",
            });
        }

        if (chat.groupAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: false,
                message: 'Only group admins can remove members!'
            });
        }

        const removedUser = await User.findById(userId).select("username");
        if (!removedUser) {
            return res.status(404).json(
                {
                    status: false,
                    message: "User to be removed not found!"
                }
            );
        }

        const isUserinGroup = chat.users.some(user => user._id.toString() === userId);
        if (!isUserinGroup) {
            return res.status(400).json({
                status: false,
                meessage: `${removedUser.username} is not the member of this group!`
            })
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            groupChatId,
            {
                $pull: { users: userId }
            },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({
            status: true,
            message: `${updatedChat.groupAdmin.username} removed ${removedUser.username} from the group ${updatedChat.chatName}`,
            chat: updatedChat,
        });
    } catch (error) {
        console.error("Error in removeFromGroup controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}

export const addToGroup = async (req, res, next) => {
    try {
        const { chatId: groupChatId, userId } = req.body;

        if (!groupChatId || !userId) {
            return res.status(400).json({
                status: false,
                message: 'GroupChatId and User Id both required'
            });
        }

        const chat = await Chat.findById(groupChatId);

        if (!chat) {
            return res.status(404).json({
                status: false,
                message: "Chat not Found"
            });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({
                status: false,
                message: "This operation is only allowed for group chats!",
            });
        }

        if (chat.groupAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: false,
                message: 'Only group admins can remove members!'
            });
        }

        const userToAdd = await User.findById(userId).select("username");

        if (!userToAdd) {
            return res.status(404).json({
                status: false,
                message: "User to be added not found!"
            });
        }

        const isUserInGroup = chat.users.some(user => user._id.toString() === userId);

        if (isUserInGroup) {
            return res.status(400).json({
                status: false,
                message: `${userToAdd.username} is already member of this group!`
            });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            groupChatId,
            {
                $push: { users: userId }
            },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({
            status: true,
            message: `${updatedChat.groupAdmin.username} added ${userToAdd.username} to the group ${updatedChat.chatName}`,
            chat: updatedChat
        });

    } catch (error) {
        console.error("Error in addToGroup controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}

export const updateGroupProfilePic = async (req, res, next) => {
    try {
        const { chatId: groupChatId } = req.body;
        const groupPicUrl = req.file ? req.file.originalname : 'default-grp-pic.jpg';

        if (!groupChatId) {
            return res.status(400).json({
                status: false,
                message: 'GroupChatId is required!'
            });
        }

        const chat = await Chat.findById(groupChatId);

        if (!chat) {
            return res.status(404).json({
                status: false,
                message: "Chat not Found"
            });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({
                status: false,
                message: "This operation is only allowed for group chats!",
            });
        }

        const isUserInGroup = chat.users.some(user => user._id.toString() === req.user._id.toString());
        if (!isUserInGroup) {
            return res.status(403).json({
                status: false,
                message: `You - ${req.user.username} is not authorized to update the group pic as you do not belong to the group!`
            });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            groupChatId,
            {
                groupPic: groupPicUrl
            },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        return res.status(200).json({
            status: true,
            message: `Group picture of ${updatedChat.chatName} group is updated sucessfully by ${req.user.username}!`,
            chat: updatedChat
        });

    } catch (error) {
        console.error("Error in groupPicUpdate controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}

export const deleteChat = async (req, res, next) => {
    try {
        const { chatId } = req.body;

        const loggedInUser = req.user._id;
        console.log(loggedInUser);
        if (!chatId) {
            return res.status(400).json({
                status: false,
                message: 'Chat ID is required!'
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                status: false,
                message: 'Chat not found!'
            });
        }
        
        const isUserInChat = chat.users.some(user =>
            user._id.toString() === loggedInUser.toString()
        );
        if (!isUserInChat) {
            return res.status(403).json({
                status: false,
                message: 'You are not authorized to access this chat!'
            });
        }
        
        if (chat.isGroupChat) {
            if (chat.groupAdmin._id.toString() !== loggedInUser.toString()) {
                return res.status(403).json({
                    status: false,
                    message: 'Only group admin can delete this group chat!'
                });
            }
           
            await Message.deleteMany({ chat: chatId });
            await Chat.deleteOne({ _id: chatId });
            return res.status(200).json({
                status: true,
                message: `Group ${chat.chatName} has been deleted by admin ${req.user.username}`,
                chatDetails: {
                    type: "Group Chat",
                    name: chat.chatName,
                    participants: chat.users.length,
                    deletedBy: req.user.username
                }
            });
            
        }
        else {
            let otherUser = chat.users.find(user => user._id.toString() !== loggedInUser.toString());
            otherUser=await User.findById(otherUser);

            await Message.deleteMany({ chat: chatId });
            await Chat.deleteOne({ _id: chatId });
            
            return res.status(200).json({
                status: true,
                message: `Chat with ${otherUser.username} has been deleted`,
                chatDetails: {
                    type: 'One-to-One Chat',
                    participants: [
                        req.user.username,
                        otherUser.username
                    ],
                    deletedBy: req.user.username
                }
            });
        }
    } catch (error) {
        console.error("Error in deleteChat controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message
        });
    }
}