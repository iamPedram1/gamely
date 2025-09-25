import express from 'express';

// Controllers
import AuthController from 'api/auth/auth.controller';

// Services
import UserService from 'api/user/user.service';

// Middlewares
import blockRequestWithToken from 'api/auth/auth.middleware';
import validateBody from 'middleware/validateBody';

// DTO
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

const authRouter = express.Router();
const userService = new UserService();
const authController = new AuthController(userService);

authRouter.post('/login', [
  blockRequestWithToken,
  validateBody(LoginDto),
  authController.login,
]);
authRouter.post('/register', [
  blockRequestWithToken,
  validateBody(RegisterDto),
  authController.register,
]);

export default authRouter;
