import { isEmail } from 'class-validator';
import { Model, Schema, model } from 'mongoose';

// Utils
import crypto from 'core/utilities/crypto';
import {
  usernameRegex,
  userRoles,
  userStatus,
} from 'features/shared/user/core/user.constant';

// Types
import type {
  IUserEntity,
  IUserEntityMethods,
} from 'features/shared/user/core/user.types';

const userSchema = new Schema<
  IUserEntity,
  Model<IUserEntity, IUserEntityMethods>,
  IUserEntityMethods
>(
  {
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
    username: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
      minlength: 3,
      maxlength: 255,
      match: usernameRegex,
      required: true,
    },
    bio: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 500,
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
    blocksCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingsCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    showLastSeen: { type: Boolean, default: true },
    isPagePrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await crypto.compare(password, this.password);
};

const methods = ['findOneAndUpdate', 'updateOne'] as const;
const hashableFields = ['password', 'recoveryKey'] as const;

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
