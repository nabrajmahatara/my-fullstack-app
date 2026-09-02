import { Timestamp } from "mongodb";
import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { ROLES,ROLE_VALUES } from "../../constants/roles.js";

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
        type:String,
        required:[true, "password is required"],
        trim:true,
        minlength:[8,"atleast 8 unique characters required"]
    },
    role: { 
      type: String, 
      enum: ROLE_VALUES,       
      default: ROLES.MEMBER,   
      required: true 
    
  },
   
    isActive:{
        type:Boolean,
        default:true
    },
    
},{timestamps:true})
userSchema.pre("save",async function () {
    if (!this.isModified("password")) return next();
  try {
    const saltRound = 10;
    this.password = await bcrypt.hash(this.password, saltRound);
    next();
  } catch (error) {
    next(error); 
  }
});
userSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}
export default mongoose.model("User", userSchema)