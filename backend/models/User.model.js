import mongoose from 'mongoose';
import validator from 'validator'
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minlength: [3,'Please enter name with atleast 3 characters'],
            unique: true,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
            validate:[validator.isEmail,'Please enter  a valid email id']
        },
        password: {
            type: String,
            required: true,
            minlength:6,
            select:false
        },
        profilePic: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {timestamps:true}
);

const User = mongoose.model("User", userSchema);
export default User;

