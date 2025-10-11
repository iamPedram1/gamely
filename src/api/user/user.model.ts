import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { FlattenMaps, HydratedDocument, Model, Schema, model } from 'mongoose';
import { isEmail } from 'class-validator';

// Utils
import { jwtPrivateKey, jwtTokenExpiresIn } from 'utilites/configs';

// Types
import type { IUserEntity } from 'api/user/user.types';

interface IUserEntityMethods {
  generateAuthToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUserEntity, IUserEntityMethods>;
export type UserLeanDocument = FlattenMaps<IUserEntity>;

const userSchema = new Schema<
  IUserEntity,
  Model<IUserEntity, IUserEntityMethods>,
  IUserEntityMethods
>(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 255,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
      immutable: true,
      validate: {
        message: 'Invalid email address.',
        validator: (v: string) => isEmail(v),
      },
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

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, jwtPrivateKey, {
    expiresIn: jwtTokenExpiresIn as `${number}d`,
  });
};

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcryptjs.compare(password, this.password);
};

const User = model('User', userSchema);

export default User;
