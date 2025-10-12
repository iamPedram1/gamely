import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserService from 'api/user/user.service';

// DTO
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

// Utilities
import { jwtCookieName } from 'utilites/configs';
import { setTokenCookie } from 'utilites/helperPack';

@injectable()
export default class AuthController {
  constructor(
    @inject(delay(() => UserService)) private userService: UserService
  ) {}

  register: RequestHandler = async (req, res) => {
    const dto = req.body as RegisterDto;

    const token = await this.userService.register(dto);
    setTokenCookie(res, token);

    res.status(204).header(jwtCookieName, token).send();
  };

  login: RequestHandler = async (req, res) => {
    const dto = req.body as LoginDto;

    const token = await this.userService.login(dto);
    setTokenCookie(res, token);

    res.status(200).header(jwtCookieName, token).send();
  };
}
