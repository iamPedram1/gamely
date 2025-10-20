import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { FlattenMaps, HydratedDocument, Model, Schema, model } from 'mongoose';
import { isEmail } from 'class-validator';

// Utils
import {
  jwtTokenKey,
  jwtTokenExpiresInMinutes,
  jwtRefreshTokenKey,
  jwtRefreshTokenExpiresInDays,
} from 'utilites/configs';

// Types
import type { IUserEntity } from 'api/user/user.types';

export interface IUserEntityMethods {
  generateToken(): string;
  generateRefreshToken(token: string): string;
  generateAuthToken(): { token: string; refreshToken: string };
  validateToken(token: string, refreshToken: string): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type IToken = { userId: string; userEmail: string };
export type IRefreshToken = {
  userId: string;
  userEmail: string;
  token: string;
};
export type UserDocument = HydratedDocument<IUserEntity, IUserEntityMethods>;
export type UserLeanDocument = FlattenMaps<IUserEntity>;

const userSchema = new Schema<
  IUserEntity,
  Model<IUserEntity, IUserEntityMethods>,
  IUserEntityMethods
>(
  {
    token: {
      type: String,
      default: null,
      trim: true,
      select: false,
    },
    refreshToken: {
      type: String,
      default: null,
      trim: true,
      select: false,
    },
    recoveryKey: {
      type: String,
      default: null,
      trim: true,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    bio: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
      immutable: true,
      validate: {
        message: 'Invalid email address',
        validator: (v: string) => isEmail(v),
      },
    },
    avatar: {
      default: null,
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 255,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function () {
  const obj: IToken = {
    userId: this._id.toHexString(),
    userEmail: this.email,
  };
  return jwt.sign(obj, jwtTokenKey, {
    expiresIn: jwtTokenExpiresInMinutes as `${number}m`,
  });
};

userSchema.methods.generateAuthToken = function () {
  const token = this.generateToken();
  const refreshToken = this.generateRefreshToken(token);

  return { token, refreshToken };
};

userSchema.methods.validateToken = function (token, refreshToken) {
  const tokenMatch = this.token === token;
  const refreshTokenMatch = this.refreshToken === refreshToken;
  if (!tokenMatch || !refreshTokenMatch) return false;

  const refreshTokenVerify = jwt.verify(
    refreshToken,
    jwtRefreshTokenKey
  ) as IRefreshToken;

  if (refreshTokenVerify.token === token) return true;
  return false;
};

userSchema.methods.generateRefreshToken = function (token: string) {
  const obj: IRefreshToken = {
    userId: this._id.toHexString(),
    userEmail: this.email,
    token,
  };
  return jwt.sign(obj, jwtRefreshTokenKey, {
    expiresIn: `${jwtRefreshTokenExpiresInDays}d`,
  });
};

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcryptjs.compare(password, this.password);
};

const User = model('User', userSchema);

export default User;
