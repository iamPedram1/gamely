import 'reflect-metadata';
import supertest, { Agent } from 'supertest';
import { beforeAll } from 'vitest';
import type { Server } from 'http';
import app from 'app';

// Utils
import logger from 'core/utilities/logger';
import { connectDatabase } from 'core/tests/database';

let request: Agent;

beforeAll(async () => {
  await connectDatabase();

  request = supertest(app);
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
