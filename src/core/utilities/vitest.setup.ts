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

// Types
import type { Server } from 'http';

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

vi.mock('features/shared/mail/mail.service', async () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      sendEmail: vi
        .fn()
        .mockResolvedValue({ success: true, message: 'Mocked' }),
      sendPasswordRecovery: vi.fn().mockResolvedValue(undefined),
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

process.on('unhandledRejection', (err) => {
  logger.error('🔴🔴🔴🔴🔴🔴 VITEST SETUP ERROR - unhandledRejection', err);
  console.log(err);
});
process.on('uncaughtException', (err) => {
  logger.error('🔴🔴🔴🔴🔴🔴 VITEST SETUP ERROR - uncaughtException', err);
  console.log(err, err?.name, err?.message, err?.cause, err?.stack);
});

export { request };
