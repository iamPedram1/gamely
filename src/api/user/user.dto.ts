import validator from 'class-validator';
import type { IUserProps } from 'api/user/user.types';

export class RegisterDto {
  constructor(user: IUserProps) {
    this.name = user?.name || '';
    this.email = user?.email || '';
    this.password = user?.password || '';
  }

  @validator.IsNotEmpty()
  @validator.IsString()
  @validator.Length(3, 255)
  name: string;

  @validator.IsNotEmpty()
  @validator.IsEmail()
  email: string;

  @validator.IsNotEmpty()
  @validator.IsString()
  @validator.Length(8, 255)
  password: string;

  async validate() {
    return validator.validate(this);
  }
}
