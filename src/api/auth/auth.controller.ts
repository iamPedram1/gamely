import { LoginDto, RegisterDto } from 'api/auth/auth.dto';
import { IUserService } from 'api/user/user.services';
import { tokenHeaderName } from 'utilites/configs';

import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationError } from 'utilites/errors';

export default class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  register: RequestHandler = async (req, res) => {
    const dto = new RegisterDto(req.body);

    const exist = await this.userService.checkEmailExist(dto.email);
    if (!exist) throw new ValidationError('email or password is incorrect.');
    // await this.userService.comparePassword()
    dto.password = await this.userService.hashPassword(dto.password);

    const token = (await this.userService.create(dto)).generateAuthToken();

    res.header(tokenHeaderName, token).status(201).json({ message: 'success' });
  };

  login: RequestHandler = async (req, res) => {
    const { email, password } = new LoginDto(req.body);
    const message = 'Email or password is incorrect.';

    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new ValidationError(message);
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) throw new ValidationError(message);

    const token = user.generateAuthToken();

    res.status(200).header(tokenHeaderName, token).send({ message: 'success' });
  };
}
