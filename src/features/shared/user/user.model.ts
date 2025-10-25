import { isEmail } from 'class-validator';
import { FlattenMaps, HydratedDocument, Model, Schema, model } from 'mongoose';

// Utils
import crypto from 'core/utilites/crypto';
import tokenUtils from 'core/services/token.service';
import { userRoles, userStatus } from 'features/shared/user/user.constants';

// Types
import type { IUserEntity } from 'features/shared/user/user.types';

export interface IUserEntityMethods {
  generateToken(): string;
  isBlocked: () => boolean;
  compareRefreshToken(refreshToken: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAuthToken(): { token: string; refreshToken: string };
  validateToken(token: string, refreshToken: string): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type IToken = { userId: string };
export type IRefreshToken = { userId: string };
export type IRecoveryKey = { userId: string };
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
    role: {
      type: String,
      enum: userRoles,
      required: true,
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: userStatus,
      default: 'active',
      index: true,
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
      index: true,
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

userSchema.methods.generateAuthToken = function () {
  const token = this.generateToken();
  const refreshToken = this.generateRefreshToken();

  return { token, refreshToken };
};

userSchema.methods.generateRefreshToken = function () {
  return tokenUtils.generateRefreshToken(this._id);
};

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await crypto.compare(password, this.password);
};

userSchema.methods.isBlocked = function () {
  return this.status === 'blocked';
};

userSchema.methods.compareRefreshToken = async function (refreshToken: string) {
  if (!refreshToken || !this.refreshToken) return false;
  return await crypto.compare(refreshToken, this.refreshToken);
};

const hashableFields = ['password', 'refreshToken', 'recoveryKey'] as const;
const methods = ['findOneAndUpdate', 'updateOne'] as const;

userSchema.pre('save', async function (next) {
  try {
    for (const field of hashableFields) {
      if (this.isModified(field) && this[field]) {
        this[field] = await crypto.hash(this[field]);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

methods.forEach((method) => {
  userSchema.pre(method, async function (next) {
    try {
      const update = this.getUpdate();

      if (!update) return next();

      if (!Array.isArray(update) && typeof update === 'object') {
        const $set = update.$set || {};

        for (const field of hashableFields) {
          if (update[field]) update[field] = await crypto.hash(update[field]);
          if ($set[field]) $set[field] = await crypto.hash($set[field]);
        }

        if (Object.keys($set).length) update.$set = $set;
      }

      next();
    } catch (err) {
      next(err);
    }
  });
});

const User = model('User', userSchema);

export default User;
