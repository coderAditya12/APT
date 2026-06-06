import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

export async function connectDB(){
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
}

export function disconnectDB(){
  return mongoose.connection.close();
}

export { mongoose };
