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
import { RefreshTokenDto } from 'api/user/user.dto';
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'features/shared/auth/auth.dto';

const authPublicRouter = express.Router();
const authController = container.resolve(AuthController);

authPublicRouter.post('/login', [
  limitier,
  blockRequestWithToken,
  validateBody(LoginDto),
  authController.login,
]);
authPublicRouter.post('/register', [
  limitier,
  blockRequestWithToken,
  validateBody(RegisterDto),
  authController.register,
]);
authPublicRouter.post('/recover-password', [
  limitier,
  blockRequestWithToken,
  validateBody(RecoverPasswordDto),
  authController.recoverPassword,
]);
authPublicRouter.post('/change-password', [
  limitier,
  blockRequestWithToken,
  validateBody(ChangePasswordDto),
  authController.changePassword,
]);
authPublicRouter.post(
  '/token/refresh',
  limitier,
  validateBody(RefreshTokenDto),
  authController.refreshToken
);
authPublicRouter.post(
  '/token/revoke',
  limitier,
  auth(['user', 'author', 'admin']),
  authController.revokeToken
);

export default authPublicRouter;
