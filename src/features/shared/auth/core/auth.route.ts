import express from 'express';
import { container } from 'tsyringe';

// Models
import User from 'features/shared/user/core/user.model';

// Controllers
import AuthController from 'features/shared/auth/core/auth.controller';
import SessionController from 'features/shared/auth/session/session.controller';

// Middlewares
import auth from 'core/middlewares/auth';
import validateBody from 'core/middlewares/validateBody';
import { limiter } from 'core/middlewares/rateLimitter';
import ensureUnique from 'core/middlewares/ensureUnique';
import blockRequestWithToken from 'features/shared/auth/core/auth.middleware';

// DTO
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RecoverPasswordDto,
  VerifyEmailDto,
  SendVerificationDto,
} from 'features/shared/auth/core/auth.dto';
import {
  RefreshTokenDto,
  RevokeTokenDto,
} from 'features/shared/auth/session/session.dto';

const authClientRouter = express.Router();
const authController = container.resolve(AuthController);
const sessionController = container.resolve(SessionController);

authClientRouter.post('/login', [
  limiter(),
  validateBody(LoginDto),
  blockRequestWithToken,
  authController.login,
]);
authClientRouter.post('/register', [
  limiter(),
  validateBody(RegisterDto),
  blockRequestWithToken,
  authController.register,
]);
authClientRouter.post('/register/resend-otp', [
  limiter(1, 180_000, 'error.try_again_after'),
  validateBody(SendVerificationDto),
  blockRequestWithToken,
  authController.resendVerifyCode,
]);
authClientRouter.post('/register/verify-email', [
  limiter(),
  validateBody(VerifyEmailDto),
  blockRequestWithToken,
  authController.verifyEmail,
]);
authClientRouter.post('/recover-password', [
  limiter(),
  validateBody(RecoverPasswordDto),
  blockRequestWithToken,
  authController.recoverPassword,
]);
authClientRouter.post('/change-password', [
  limiter(),
  validateBody(ChangePasswordDto),
  blockRequestWithToken,
  authController.changePassword,
]);
authClientRouter.post(
  '/token/refresh',
  limiter(),
  validateBody(RefreshTokenDto),
  sessionController.refreshToken
);
authClientRouter.post(
  '/token/revoke',
  limiter(),
  validateBody(RevokeTokenDto),
  auth(['user', 'author', 'admin', 'superAdmin']),
  sessionController.revokeToken
);

export default authClientRouter;
