import mongoose from 'mongoose';
import { DB_Name } from '../constant.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_Name}`
    );
    console.log(
      `\n MongoDB is connected !! DB host: ${connectionInstance.connection.host}`
    );
    return connectionInstance;
  } catch (error) {
    console.log('MongoDB connection error', error);
    process.exit(1);
  }
};

export { connectDB };
