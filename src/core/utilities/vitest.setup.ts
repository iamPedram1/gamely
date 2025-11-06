import 'reflect-metadata';
import supertest, { Agent } from 'supertest';
import { beforeAll } from 'vitest';
import app from 'app';

// Utils
import logger from 'core/utilities/logger';
import { connectDatabase } from 'core/tests/database';

let request: Agent;

beforeAll(async () => {
  await connectDatabase();

  request = supertest(app);
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
