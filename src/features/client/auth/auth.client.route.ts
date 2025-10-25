import express from 'express';
import { container } from 'tsyringe';

// Controllers
import AuthController from 'features/shared/auth/auth.controller';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { limitier } from 'core/middlewares/rateLimitter';
import blockRequestWithToken from 'features/shared/auth/auth.middleware';

// DTO
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  RecoverPasswordDto,
} from 'features/shared/auth/auth.dto';

const authClientRouter = express.Router();
const authController = container.resolve(AuthController);

authClientRouter.post('/login', [
  limitier,
  blockRequestWithToken,
  validateBody(LoginDto),
  authController.login,
]);
authClientRouter.post('/register', [
  limitier,
  blockRequestWithToken,
  validateBody(RegisterDto),
  authController.register,
]);
authClientRouter.post('/recover-password', [
  limitier,
  blockRequestWithToken,
  validateBody(RecoverPasswordDto),
  authController.recoverPassword,
]);
authClientRouter.post('/change-password', [
  limitier,
  blockRequestWithToken,
  validateBody(ChangePasswordDto),
  authController.changePassword,
]);
authClientRouter.post(
  '/token/refresh',
  limitier,
  validateBody(RefreshTokenDto),
  authController.refreshToken
);
authClientRouter.post(
  '/token/revoke',
  limitier,
  auth(['user', 'author', 'admin', 'superAdmin']),
  authController.revokeToken
);

export default authClientRouter;
