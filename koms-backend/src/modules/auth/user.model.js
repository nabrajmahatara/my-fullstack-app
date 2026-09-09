import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'at least 3 characters required'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      trim: true,
      minlength: [8, 'at least 8 characters required'],
      select: false,
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Modernized async pre-save hook (removed 'next' callback)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
