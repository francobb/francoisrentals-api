import {Collection} from "mongodb";

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// let mongod = new MongoMemoryServer();
let mongod;

/**
 * Connect to the in-memory database.
 */
export const connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = await mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  };
  await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async () => {
  const collections: Collection[] = await mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
