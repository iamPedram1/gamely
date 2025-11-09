import { container } from 'tsyringe';
import { faker } from '@faker-js/faker';

// Services
import UserService from 'features/shared/user/core/user.service';

// Utils
import { sendBanRequest } from 'features/management/user/ban/tests/ban.testUtils';
import {
  expectBadRequest,
  expectForbiddenRequest,
  describe200,
  describe400,
  describe403,
} from 'core/utilities/testHelpers';
import {
  createUser,
  generateAccessToken,
  generateUser,
  registerAndLogin,
  sendChangePasswordRequest,
  sendLoginRequest,
  sendRecoverPasswordRequest,
  sendRegisterRequest,
} from 'features/shared/auth/core/tests/auth.testUtils';

// Dto
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'features/shared/auth/core/auth.dto';

describe('auth routes', () => {
  const userService = container.resolve(UserService);

  describe('POST /register', () => {
    let token: string;
    let payload: RegisterDto;

    beforeEach(() => {
      payload = generateUser();
      token = '';
    });

    const exec = async (overwriteToken?: string) =>
      await sendRegisterRequest({ payload, token: overwriteToken ?? token });

    describe200(() => {
      it('if user has valid payload', async () => {
        const response = await exec();

        expect(response.status).toBe(201);
      });
    });

    describe400(() => {
      it('if user have token in header', async () => {
        token = generateAccessToken();

        const response = await exec();

        expectBadRequest(response);
      });

      it('if the email is already taken', async () => {
        const user = await createUser();
        payload.email = user.email;

        const response = await exec();

        expectBadRequest(response, /exists/i);
      });

      it('if the email is not provided in payload', async () => {
        payload.email = '';

        const response = await exec();
        expectBadRequest(response, /valid email/i);
      });

      it('if the email is not valid', async () => {
        payload.email = 'email.abcedfg';

        const response = await exec();
        expectBadRequest(response, /valid email/i);
      });

      it('if the password is not provided in payload', async () => {
        payload.password = '';

        const response = await exec();
        expectBadRequest(response, /characters/i);
      });
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

    const exec = async (overwriteToken?: string) =>
      await sendLoginRequest({ payload, token: overwriteToken ?? token });

    describe200(() => {
      it('if user credentials is valid', async () => {
        await sendRegisterRequest({ payload: register });

        const response = await exec();

        expect(response.status).toBe(200);
      });
    });

    describe400(() => {
      it('if user have token in header', async () => {
        token = generateAccessToken();

        const response = await exec();

        expectBadRequest(response);
      });

      it('if password is incorrect', async () => {
        await sendRegisterRequest({ payload: register });

        payload.password = 'incorrect-password';

        const response = await exec();

        expectBadRequest(response, /email or password/i);
      });

      it('if password provided in payload', async () => {
        payload.password = '';

        const response = await exec();
        expectBadRequest(response, /characters/i);
      });
    });

    describe403(() => {
      it('if user is banned', async () => {
        await sendRegisterRequest({ payload: register });
        const user = await userService.getOneByKey('email', payload.email, {
          lean: true,
        });
        const adminToken = (await registerAndLogin({ role: 'admin' }))!
          .accessToken;
        await sendBanRequest(user._id.toHexString(), { token: adminToken });

        const response = await exec();

        expectForbiddenRequest(response, /suspended/);
      });
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

    const exec = async (overwriteToken?: string) =>
      await sendRecoverPasswordRequest({
        payload,
        token: overwriteToken ?? token,
      });

    describe200(() => {
      it('if email does not exist', async () => {
        payload.email = 'somethingTezt@gmail.com';

        const response = await exec();

        expect(response.status).toBe(200);
      });

      it('if email exists', async () => {
        const response = await exec();

        expect(response.status).toBe(200);
      });
      it('and set recoverKey in user model if email exist', async () => {
        const response = await exec();

        const user = await userService.getUserByEmail(register.email, {
          select: '+recoveryKey',
        });

        expect(user.email).toBe(register.email.toLowerCase());
        expect(user.recoveryKey).toBeDefined();
        expect(response.status).toBe(200);
      });
    });

    describe400(() => {
      it('if user have token in header', async () => {
        token = generateAccessToken();

        const response = await exec();

        expectBadRequest(response);
      });
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

    const exec = async (overwriteToken?: string) =>
      await sendChangePasswordRequest({
        payload,
        token: overwriteToken ?? token,
      });

    describe200(() => {
      it('and change the password if recoveryKey is valid', async () => {
        const recoverResponse = await sendRecoverPasswordRequest({
          payload: { email: register.email },
        });
        payload.recoveryKey = recoverResponse.body.data?.recoveryKey || '';

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

      it('and clear recoveryKey if password changed', async () => {
        const recoverResponse = await sendRecoverPasswordRequest({
          payload: { email: register.email },
        });

        payload.recoveryKey = recoverResponse?.body?.data?.recoveryKey || '';

        const response = await exec();

        const user = await userService.getUserByEmail(register.email, {
          select: '+recoveryKey',
        });

        expect(response.status).toBe(200);
        expect(user.recoveryKey).toBeNull();
      });
    });
    describe400(() => {
      it('if user have token in header', async () => {
        token = generateAccessToken();

        const response = await exec();

        expectBadRequest(response);
      });

      it('if recoveryKey does not exist', async () => {
        const response = await exec();

        expectBadRequest(response);
      });
    });
  });
});
