import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongod: MongoMemoryReplSet;

export const connectDatabase = async (): Promise<void> => {
  mongod = await MongoMemoryReplSet.create({
    binary: {
      version: '7.0.24',
      downloadDir: 'C:/Users/Pedi/Downloads/Programs',
      checkMD5: false,
    },
    replSet: { count: 1 },
  });
  await mongoose.connect(mongod.getUri());
};

export const closeDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod?.stop();
  }
};

export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
};
