import 'reflect-metadata';
import supertest, { Agent } from 'supertest';
import { beforeAll } from 'vitest';
import app from 'app';

// Utils
import logger from 'core/utilities/logger';
import {
  clearDatabase,
  closeDatabase,
  connectDatabase,
} from 'core/utilities/database';
import { Server } from 'http';

let request: Agent;
let server: Server;

beforeAll(async () => {
  await connectDatabase();
  server = app.listen(0);
  request = supertest(server);
});

afterAll(async () => {
  await closeDatabase();
  server.close();
});

beforeEach(async () => {
  await clearDatabase();
});

vi.mock('core/utilities/mail', () => ({
  sendEmail: vi.fn(async (args) => {
    return { success: true, message: 'Mocked email success 🚀' };
  }),
}));

process.on('unhandledRejection', (err) => {
  logger.error('🔴🔴🔴🔴🔴🔴 VITEST SETUP ERROR - unhandledRejection', err);
  console.log(err);
});
process.on('uncaughtException', (err) => {
  logger.error('🔴🔴🔴🔴🔴🔴 VITEST SETUP ERROR - uncaughtException', err);
  console.log(err, err?.name, err?.message, err?.cause, err?.stack);
});

export { request };
