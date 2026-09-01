import { Timestamp } from "mongodb";
import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const {Schema}= mongoose;

const userSchema = new mongoose.Schema ({

    username :{
        type: String,
        required:[true, "username is required"],
        unique:true,
        trim:true,
        lowercase:true,
        minlength:[3,"atleast 3 characters required"]
    },
    email:{
        type:String,
        required:[true, "email is required"],
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        trype:String,
        required:[true, "password is required"],
        unique:true,
        trim:true,
        minlength:[8,"atleast 8 unique characters required"]
    },
    role:{
        type:String,
        enum:["user", "Admin"],
        default:"user"
    },
    isActive:{
        type:Boolean,
        default:true
    },
    
    


},{timestamps:true})
Userschema.pre("save",async function () {
    if (!this.isModified("password")) return;
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(this.password,saltRound);
    this.password = hashedPassword
})
Userschema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}
export default mongoose.model("user", userSchema)