import Message from './../models/Message.Model.js';
import Chat from '../models/Chat.Model.js';
import User from '../models/User.model.js';

export const sendMessage = async (req, res, next) => {
    try {
        const { chatId, content } = req.body;
        const attachmentUrl = req.file ? req.file.originalname : "";
        const sender = req.user._id;
        if (!chatId || !content) {
            return res.status(400).json({
                status: false,
                message: 'Chat ID and message content are required'
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                status: false,
                message: 'Chat not found!'
            });
        }

        const isUserInChat = chat.users.some(user => user._id.toString() === req.user._id.toString());
        if (!isUserInChat) {
            return res.status(403).json({
                status: false,
                message: `${req.user.username} is not authorized to send the message in this chat!`
            });
        }

        let newMessage = await Message({
            sender: sender,
            content: content,
            chat: chatId,
            attachment: attachmentUrl
        });

        await newMessage.save();

        await Chat.findByIdAndUpdate(
            chatId,
            { latestMessage: newMessage },
            { new: true }
        );

        newMessage = await newMessage.populate("sender", "username profilePic");
        newMessage = await User.populate(newMessage, {
            path: "chat.users",
            select: "username profilePic"
        });
        newMessage = await newMessage.populate(
            {
                path: 'chat',
                populate: {
                    path: 'latestMessage',
                    populate: { path: 'sender' },
                }
            }
        )

        res.status(200).json({
            status: true,
            message: "Message sent successfully!",
            data: newMessage,
        });
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
};

export const getAllMessage = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        console.log(chatId);
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(400).json({
                status: false,
                message: 'Chat not found!'
            });
        }

        const isUserInChat = chat.users.some(user => user._id.toString() === req.user._id.toString());
        if (!isUserInChat) {
            return res.status(403).json({
                status: false,
                message: `${req.user.username} is not authorized to send the message in this chat!`
            });
        }

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "username profilePic email")
            .populate({
                path: "chat",
                populate: {
                    path: "latestMessage",
                    populate: { path: 'sender' }
                }
            });

        if (!messages || messages.length == 0) {
            return res.status(404).json({
                status: false,
                message: 'No messages found for this chat!'
            });
        }

        return res.status(200).json({
            status: true,
            messages: "Messages retrieved successfully!",
            data: messages
        });
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error!",
            error: error.message,
        });
    }
}