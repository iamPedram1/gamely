import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import mongoose, { FlattenMaps, HydratedDocument } from 'mongoose';
import { isEmail } from 'class-validator';

// Utils
import { jwtPrivateKey } from 'utilites/configs';

// Types
import type { IUserEntity } from 'api/user/user.types';

export type UserDocument = HydratedDocument<IUserEntity, IUserEntityMethods>;
export type UserLeanDocument = FlattenMaps<IUserEntity>;

interface IUserEntityMethods {
  generateAuthToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<
  IUserEntity,
  mongoose.Model<IUserEntity, IUserEntityMethods>,
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
      required: true,
      immutable: true,
      validator: {
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
  return jwt.sign({ _id: this._id, email: this.email }, jwtPrivateKey);
};

userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
