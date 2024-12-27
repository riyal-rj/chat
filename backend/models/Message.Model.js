import mongoose from "mongoose";

const messageSchema=new mongoose.Schema(
    {
        content:{
            type:String,
        },
        attachment:{
            type:String
        },
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        chat:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Chat"
        }
    },
    {
        timestamps:true
    }
);

const Message=mongoose.model("Messages",messageSchema);
export default Message;