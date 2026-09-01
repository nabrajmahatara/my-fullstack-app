import mongoose from 'mongoose';
import config from './env.js';

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

export default connectDB; 
