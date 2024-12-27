import mongoose from "mongoose";

const chatSchema=new mongoose.Schema(
    {
        isGroupChat:{
            type:Boolean,
            default:false
        },
        chatName:{
            type:String,
            trim:true
        },
        users:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }],
        latestMessage:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Messages"
        },
        groupAdmin:{
             type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        groupPic:{
            type:String
        }
    },{timestamps:true}
);

const Chat=mongoose.model('Chat',chatSchema);

export default Chat;