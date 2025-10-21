import { FlattenMaps, HydratedDocument, Model, Schema, model } from 'mongoose';
import { isEmail } from 'class-validator';

// Utils
import crypto from 'core/utilites/crypto';
import tokenUtils from 'core/services/token.service';

// Types
import type { IUserEntity } from 'api/user/user.types';

export interface IUserEntityMethods {
  generateToken(): string;
  compareRefreshToken(refreshToken: string): Promise<boolean>;
  generateRefreshToken(token: string): Promise<string>;
  generateAuthToken(): Promise<{ token: string; refreshToken: string }>;
  validateToken(token: string, refreshToken: string): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type IToken = { userId: string };
export type IRefreshToken = { userId: string };
export type UserDocument = HydratedDocument<IUserEntity, IUserEntityMethods>;
export type UserLeanDocument = FlattenMaps<IUserEntity>;

const userSchema = new Schema<
  IUserEntity,
  Model<IUserEntity, IUserEntityMethods>,
  IUserEntityMethods
>(
  {
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
  return tokenUtils.generateToken(this._id);
};

userSchema.methods.generateAuthToken = async function () {
  const token = tokenUtils.generateToken(this._id);
  const refreshToken = await tokenUtils.generateRefreshToken(this._id);

  return { token, refreshToken };
};

userSchema.methods.generateRefreshToken = async function () {
  return await tokenUtils.generateRefreshToken(this._id);
};

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await crypto.compare(password, this.password);
};

userSchema.methods.compareRefreshToken = async function (refreshToken: string) {
  if (!refreshToken || !this.refreshToken) return false;
  return await crypto.compare(refreshToken, this.refreshToken);
};

const User = model('User', userSchema);

export default User;
