import { container } from 'tsyringe';
import { faker } from '@faker-js/faker';

// Services
import UserService from 'features/shared/user/core/user.service';

// Utils
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'features/shared/auth/core/auth.dto';
import {
  createUser,
  expectBadRequest,
  generateAccessToken,
  generateUser,
  sendChangePasswordRequest,
  sendLoginRequest,
  sendRecoverPasswordRequest,
  sendRegisterRequest,
} from 'core/utilities/testHelpers';

describe('auth routes', () => {
  const userService = container.resolve(UserService);

  describe('POST /register', () => {
    let token: string;
    let payload: RegisterDto;

    beforeEach(() => {
      payload = generateUser();
      token = '';
    });

    const exec = async () => await sendRegisterRequest({ payload, token });

    it('should return 400 if user have token in header', async () => {
      token = generateAccessToken();

      const response = await exec();

      expectBadRequest(response);
    });

    it('should return 201 if user has valid payload', async () => {
      const response = await exec();

      expect(response.status).toBe(201);
    });

    it('should return 400 if the email is already taken', async () => {
      const user = await createUser();
      payload.email = user.email;

      const response = await exec();

      expectBadRequest(response, /exists/i);
    });

    it('should return 400 if the email is not provided in payload', async () => {
      payload.email = '';

      const response = await exec();
      expectBadRequest(response, /valid email/i);
    });

    it('should return 400 if the email is not valid', async () => {
      payload.email = 'email.abcedfg';

      const response = await exec();
      expectBadRequest(response, /valid email/i);
    });

    it('should return 400 if the password is not provided in payload', async () => {
      payload.password = '';

      const response = await exec();
      expectBadRequest(response, /characters/i);
    });
  });

  describe('POST /login', () => {
    let token: string;
    let register: RegisterDto;
    let payload: LoginDto;

    beforeEach(() => {
      register = generateUser();
      payload = register;
      token = '';
    });

    const exec = async () => await sendLoginRequest({ payload, token });

    it('should return 400 if user have token in header', async () => {
      token = generateAccessToken();

      const response = await exec();

      expectBadRequest(response);
    });

    it('should return 200 if user credentials is valid', async () => {
      await sendRegisterRequest({ payload: register });

      const response = await exec();

      expect(response.status).toBe(200);
    });

    it('should return 400 if password is not correct', async () => {
      await sendRegisterRequest({ payload: register });

      payload.password = 'incorrect-password';

      const response = await exec();

      expectBadRequest(response, /email or password/i);
    });

    it('should return 400 if the password is not provided in payload', async () => {
      payload.password = '';

      const response = await exec();
      expectBadRequest(response, /characters/i);
    });
  });

  describe('POST /recover-password', () => {
    let token: string;
    let payload: RecoverPasswordDto;
    let register: RegisterDto;

    beforeEach(async () => {
      register = generateUser();
      await sendRegisterRequest({ payload: register });
      payload = { email: register.email };
      token = '';
    });

    const exec = async () =>
      await sendRecoverPasswordRequest({ payload, token });

    it('should return 400 if user have token in header', async () => {
      token = generateAccessToken();

      const response = await exec();

      expectBadRequest(response);
    });

    it('should return 200 if email does not exist', async () => {
      payload.email = 'somethingTezt@gmail.com';

      const response = await exec();

      expect(response.status).toBe(200);
    });

    it('should return 200 if email exists', async () => {
      const response = await exec();

      expect(response.status).toBe(200);
    });

    it('should set recoverKey in user model if email exist', async () => {
      const response = await exec();

      const user = await userService.getUserByEmail(register.email, {
        select: '+recoveryKey',
      });

      expect(user.email).toBe(register.email.toLowerCase());
      expect(user.recoveryKey).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe('POST /change-password', () => {
    let token: string;
    let register: RegisterDto;
    let payload: ChangePasswordDto;

    beforeEach(async () => {
      token = '';
      register = generateUser();

      await sendRegisterRequest({ payload: register });

      payload = {
        password: faker.internet.password(),
        recoveryKey: '',
      };
    });

    const exec = async () =>
      await sendChangePasswordRequest({ payload, token });

    it('should return 400 if user have token in header', async () => {
      token = generateAccessToken();

      const response = await exec();

      expectBadRequest(response);
    });

    it('should return 400 if recoveryKey does not exist', async () => {
      const response = await exec();

      expectBadRequest(response);
    });

    it('should change the password if recoveryKey is valid', async () => {
      const recoverResponse = await sendRecoverPasswordRequest({
        payload: { email: register.email },
      });
      payload.recoveryKey = recoverResponse.body.data!.recoveryKey;

      const userPrev = await userService.getUserByEmail(register.email, {
        select: '+recoveryKey +password',
      });

      const response = await exec();

      const userAfter = await userService.getUserByEmail(register.email, {
        select: '+recoveryKey +password',
      });

      expect(response.status).toBe(200);
      expect(userPrev.recoveryKey).toBeDefined();

      expect(userAfter.password).not.toBe(userPrev.password);
    });

    it('should clear recoveryKey if password changed', async () => {
      const recoverResponse = await sendRecoverPasswordRequest({
        payload: { email: register.email },
      });

      payload.recoveryKey = recoverResponse?.body?.data!.recoveryKey;

      const response = await exec();

      const user = await userService.getUserByEmail(register.email, {
        select: '+recoveryKey',
      });

      expect(response.status).toBe(200);
      expect(user.recoveryKey).toBeNull();
    });
  });
});
