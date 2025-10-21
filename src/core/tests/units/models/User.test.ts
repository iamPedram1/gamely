import User from 'api/user/user.model';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { jwtAccessTokenKey } from 'core/utilites/configs';

describe('UserModel Unit Tests', () => {
  describe('generateAuthToken', () => {
    it('should generate a valid jwt token', () => {
      const payload = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        email: 'Test@gmail.com',
      };

      const user = new User(payload);

      const token = user.generateToken();
      const decoded = jwt.verify(token, jwtAccessTokenKey);

      expect(token).toBeDefined();
      expect(decoded).toMatchObject(payload);
    });
  });
});
