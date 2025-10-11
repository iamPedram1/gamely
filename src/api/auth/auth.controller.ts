import type { RequestHandler } from 'express';

// Service
import { IUserService } from 'api/user/user.service';

// DTO
import { LoginDto, RegisterDto } from 'api/auth/auth.dto';

// Utilities
import { jwtCookieName } from 'utilites/configs';
import { setTokenCookie } from 'utilites/helperPack';

export default class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

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
