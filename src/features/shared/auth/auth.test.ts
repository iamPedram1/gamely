import server from 'app';
import mongoose from 'mongoose';
import request from 'supertest';

// Models
import User from 'features/shared/user/user.model';

// Utils
import { prefixBaseUrl } from 'core/utilities/configs';
import { jwtAccessTokenName } from 'features/shared/session/session.constants';

// Types
import { IUserEntity } from 'features/shared/user/user.types';
import { RegisterDto } from 'features/shared/auth/auth.dto';

describe('auth routes', () => {
  const registerURL = prefixBaseUrl('/auth/register');
  const loginURL = prefixBaseUrl('/auth/login');

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /register', () => {
    let token: string;
    let payload: RegisterDto;

    beforeEach(() => {
      token = '';

      payload = {
        name: 'Pedram',
        email: 'email@gmail.com',
        password: '123456789',
      };
    });

    afterEach(async () => {
      await User.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .post(registerURL)
        .set(jwtAccessTokenName, token)
        .send(payload);
    };

    it('should return 400 if user have token in header', async () => {
      token = new User(payload).generateToken();

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is not valid', async () => {
      payload.email = 'test1234';

      const response = await exec();

      expect(response.status).toBe(400);
    });
    it('should return 400 if password is not valid', async () => {
      payload.password = '123';

      const response = await exec();

      expect(response.status).toBe(400);
    });
    it('should return 400 if name is not valid', async () => {
      payload.name = 'ab';

      const response = await exec();

      expect(response.status).toBe(400);
    });
    it('should return 201 if payload is valid', async () => {
      const response = await exec();

      expect(response.status).toBe(201);
    });
  });

  describe('POST /login', () => {
    let token: string;
    let payload: Pick<IUserEntity, 'email' | 'password'>;

    beforeEach(() => {
      token = '';

      payload = {
        email: 'test@gmail.com',
        password: '123456789',
      };
    });

    afterEach(async () => {
      await User.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .post(loginURL)
        .set(jwtAccessTokenName, token)
        .send(payload);
    };

    it('should return 400 if user have token', async () => {
      token = new User({ name: 'User', ...payload }).generateToken();
      const result = await exec();

      expect(result.status).toBe(400);
    });

    it('should return 400 if email not valid', async () => {
      payload.email = 'test.com';
      const result = await exec();

      expect(result.status).toBe(400);
    });

    it('should return 400 if password not valid', async () => {
      payload.password = '123';
      const result = await exec();

      expect(result.status).toBe(400);
    });

    it('should generate token if payload is valid', async () => {
      // Register
      await request(server)
        .post(registerURL)
        .send({ name: 'test', ...payload });

      // Login
      const result = await exec();

      expect(result.status).toBe(200);
      expect(result.headers).toHaveProperty(jwtAccessTokenName);
    });
  });
});
