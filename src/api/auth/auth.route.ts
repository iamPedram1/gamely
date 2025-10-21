import express from 'express';
import { container } from 'tsyringe';

// Controllers
import AuthController from 'api/auth/auth.controller';

// Middlewares
import validateBody from 'core/middlewares/validateBody';
import { limitier } from 'core/middlewares/rateLimitter';
import blockRequestWithToken from 'api/auth/auth.middleware';

// DTO
import {
  ChangePasswordDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
} from 'api/auth/auth.dto';
const authRouter = express.Router();
const authController = container.resolve(AuthController);

authRouter.post('/login', [
  limitier,
  blockRequestWithToken,
  validateBody(LoginDto),
  authController.login,
]);
authRouter.post('/register', [
  limitier,
  blockRequestWithToken,
  validateBody(RegisterDto),
  authController.register,
]);
authRouter.post('/recover-password', [
  limitier,
  blockRequestWithToken,
  validateBody(RecoverPasswordDto),
  authController.recoverPassword,
]);
authRouter.post('/change-password', [
  limitier,
  blockRequestWithToken,
  validateBody(ChangePasswordDto),
  authController.changePassword,
]);

export default authRouter;
