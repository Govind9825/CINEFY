import mongoose from "mongoose";
import Email from "next-auth/providers/email";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    premium : {
        type : Boolean,
        required : true,
        default : false
    }
})

export default mongoose.models.User || mongoose.model('User',userSchema)