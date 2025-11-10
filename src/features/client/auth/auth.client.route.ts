import express from 'express';
import { container } from 'tsyringe';

// Controllers
import AuthController from 'features/shared/auth/core/auth.controller';
import SessionController from 'features/shared/auth/session/session.controller';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { limitier } from 'core/middlewares/rateLimitter';
import blockRequestWithToken from 'features/shared/auth/core/auth.middleware';

// DTO
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RecoverPasswordDto,
} from 'features/shared/auth/core/auth.dto';
import {
  RefreshTokenDto,
  RevokeTokenDto,
} from 'features/shared/auth/session/session.dto';
import validateUniqueConflict from 'core/middlewares/uniqueCheckerConflict';
import User from 'features/shared/user/core/user.model';

const authClientRouter = express.Router();
const authController = container.resolve(AuthController);
const sessionController = container.resolve(SessionController);

authClientRouter.post('/login', [
  limitier,
  validateBody(LoginDto),
  blockRequestWithToken,
  authController.login,
]);
authClientRouter.post('/register', [
  limitier,
  validateBody(RegisterDto),
  blockRequestWithToken,
  validateUniqueConflict(User, 'username', 'username'),
  authController.register,
]);
authClientRouter.post('/recover-password', [
  limitier,
  validateBody(RecoverPasswordDto),
  blockRequestWithToken,
  authController.recoverPassword,
]);
authClientRouter.post('/change-password', [
  limitier,
  validateBody(ChangePasswordDto),
  blockRequestWithToken,
  authController.changePassword,
]);
authClientRouter.post(
  '/token/refresh',
  limitier,
  validateBody(RefreshTokenDto),
  sessionController.refreshToken
);
authClientRouter.post(
  '/token/revoke',
  limitier,
  validateBody(RevokeTokenDto),
  auth(['user', 'author', 'admin', 'superAdmin']),
  sessionController.revokeToken
);

export default authClientRouter;
