import 'reflect-metadata';
import startApp from 'app';
import { beforeAll, afterAll } from 'vitest';
import supertest, { Agent } from 'supertest';
import { Server } from 'http';

let server: Server;
let request: Agent;

beforeAll(async () => {
  server = await startApp();

  request = supertest(server);
});

export { server, request };
