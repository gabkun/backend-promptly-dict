import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'user'], 
      default: 'user',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  UserSchema.pre('save', async function (next) {
    if (this.role === 'admin') {
      const adminExists = await mongoose.model('User').countDocuments({ role: 'admin' });
      if (adminExists) {
        throw new Error('An admin already exists. Only one admin is allowed.');
      }
    }
    next();
  });
  
export default mongoose.model('User', UserSchema);