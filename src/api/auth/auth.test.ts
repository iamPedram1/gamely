import server from 'app';
import request from 'supertest';

// Models
import User from 'api/user/user.model';

// Utils
import { prefixBaseUrl, tokenHeaderName } from 'utilites/configs';

// Types
import { IUserProps } from 'api/user/user.types';

describe('auth routes', () => {
  const registerURL = prefixBaseUrl('/auth/register');
  const loginURL = prefixBaseUrl('/auth/login');

  describe('POST /register', () => {
    let token: string;
    let payload: IUserProps;

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
      await server.close();
    });

    const exec = async () => {
      return await request(server)
        .post(registerURL)
        .set(tokenHeaderName, token)
        .send(payload);
    };

    it('should return 400 if user have token in header', async () => {
      token = new User(payload).generateAuthToken();

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
    let payload: Pick<IUserProps, 'email' | 'password'>;

    beforeEach(() => {
      token = '';

      payload = {
        email: 'test@gmail.com',
        password: '123456789',
      };
    });

    afterEach(async () => {
      await User.deleteMany({});
      await server.close();
    });

    const exec = async () => {
      return await request(server)
        .post(loginURL)
        .set(tokenHeaderName, token)
        .send(payload);
    };

    it('should return 400 if user have token', async () => {
      token = new User({ name: 'User', ...payload }).generateAuthToken();
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
      expect(result.headers).toHaveProperty(tokenHeaderName);
    });
  });
});
