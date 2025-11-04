import request from 'supertest';
import { server } from 'core/utilities/vitest.setup';

const supertest = () => request(server);

export default supertest;
