
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/lost2found';

    // Use in-memory MongoDB only for local development when connecting to localhost
    if (
      process.env.NODE_ENV !== 'production' &&
      mongoUri.includes('localhost')
    ) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memoryUri = mongod.getUri();

        await mongoose.connect(memoryUri);
        console.log('Using mongodb-memory-server for local development');
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        return;
      } catch (memError: any) {
        console.warn(
          `MongoMemoryServer unavailable (${memError?.message || memError}), falling back to direct connection: ${mongoUri}`
        );
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error(`MongoDB connection error: ${message}`);
    process.exit(1);
  }
};
