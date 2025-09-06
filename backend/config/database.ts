import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tweetwatch';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');


    mongoose.connection.on('error', (error) => {
      console.error(' MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
