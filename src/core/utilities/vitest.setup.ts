import 'reflect-metadata';
import mongoose from 'mongoose';
import logger from 'core/utilities/logger';
import startApp from 'app';

export let server: any;

beforeAll(async () => {
  // Start server & connect DB
  server = await startApp();

  logger.info('✅ Test DB ready');
});

beforeEach(async () => {
  await cleanUp();
});

afterAll(async () => {
  if (server) {
    await server.close();
    logger.info('🛑 Server stopped after tests');
  }
});

async function cleanUp() {
  (await mongoose?.connection?.db?.dropDatabase()) || [];
}
