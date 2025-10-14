import express from 'express';
import { container } from 'tsyringe';

// Controllers
import AuthController from 'api/auth/auth.controller';

// Middlewares
import validateBody from 'middleware/validateBody';
import { limitier } from 'middleware/rateLimitter';
import blockRequestWithToken from 'api/auth/auth.middleware';

// DTO
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';
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

export default authRouter;
