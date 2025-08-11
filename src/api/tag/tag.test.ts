import server from 'app';
import request from 'supertest';
import mongoose from 'mongoose';

// Models
import Tag from 'api/tag/tag.model';
import User from 'api/user/user.model';

// Utils
import { prefixBaseUrl, tokenHeaderName } from 'utilites/configs';

// Types
import { ITagProps } from 'api/tag/tag.type';

describe('tag routes', () => {
  describe('POST /', () => {
    let token: string;
    let userId: string;
    let payload: Pick<ITagProps, 'title' | 'slug'> = {
      slug: '',
      title: '',
    };

    beforeEach(async () => {
      const user = await new User({
        email: 'test@gmail.com',
        password: '123456789',
        name: 'Test',
      }).save();

      userId = user._id.toHexString();
      token = user.generateAuthToken();
      payload = { title: 'Action', slug: 'action' };
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Tag.deleteMany({});
      server.close();
    });

    const exec = async () => {
      return await request(server)
        .post(prefixBaseUrl('/tags'))
        .set(tokenHeaderName, token)
        .send(payload);
    };

    it('should return 401 if no token passed', async () => {
      token = '';

      const response = await exec();

      expect(response.status).toBe(401);
    });

    it('should return 400 if title is not valid', async () => {
      payload.title = 'ab';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 400 if slug is not valid', async () => {
      payload.slug = '-';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 400 if slug is taken', async () => {
      await new Tag({ ...payload, creator: userId }).save();

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 201 if payload is valid', async () => {
      const response = await exec();

      expect(response.body.data).toMatchObject(payload);
      expect(response.status).toBe(201);
    });
  });
  describe('PATCH /', () => {
    let token: string;
    let tagId: string;
    let userId: string;
    let payload: Pick<ITagProps, 'title' | 'slug'> = {
      slug: '',
      title: '',
    };

    beforeEach(async () => {
      const user = await new User({
        email: 'test@gmail.com',
        password: '123456789',
        name: 'Test',
      }).save();

      tagId = '';
      userId = user._id.toHexString();
      token = user.generateAuthToken();
      payload = { title: 'Action', slug: 'action' };
      const tag = await new Tag({ ...payload, creator: userId }).save();
      tagId = tag._id.toHexString();
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Tag.deleteMany({});
      server.close();
    });

    const exec = async () => {
      return await request(server)
        .patch(prefixBaseUrl(`/tags/${tagId}`))
        .set(tokenHeaderName, token)
        .send(payload);
    };

    it('should return 401 if no token passed', async () => {
      token = '';

      const response = await exec();

      expect(response.status).toBe(401);
    });

    it('should return 400 if title is not valid', async () => {
      payload.title = 'ab';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 400 if slug is not valid', async () => {
      payload.slug = '-';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 400 if slug is taken', async () => {
      const newTag = await new Tag({
        title: 'Drama',
        slug: 'drama',
        creator: userId,
      }).save();

      payload.slug = newTag.slug;
      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 201 if payload is valid', async () => {
      payload = { title: 'Drama', slug: 'drama' };
      const response = await exec();

      expect(response.body.data).toMatchObject(payload);
      expect(response.status).toBe(200);
    });
  });
  describe('DELETE /:id', () => {
    let token: string = '';
    let tagId: string = '';
    let userId: string = '';

    beforeEach(async () => {
      const user = await new User({
        email: 'test@gmail.com',
        password: '123456789',
        name: 'Test',
      }).save();
      userId = user._id.toHexString();
      token = user.generateAuthToken();
      const tag = await new Tag({
        title: 'Drama',
        slug: 'drama',
        creator: userId,
      }).save();
      tagId = tag._id.toHexString();
    });

    afterEach(async () => {
      server.close();
      await User.deleteMany({});
      await Tag.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .delete(prefixBaseUrl(`/tags/${tagId}`))
        .set(tokenHeaderName, token)
        .send();
    };

    it('should return 401 if no token passed', async () => {
      token = '';

      const response = await exec();

      expect(response.status).toBe(401);
    });

    it('should return 400 if invalid id passed', async () => {
      tagId = 'abcdefg';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 404 if tag id dosent exist passed', async () => {
      tagId = new mongoose.Types.ObjectId().toHexString();

      const response = await exec();

      expect(response.status).toBe(404);
    });

    it('should remove the tag if id is valid', async () => {
      const response = await exec();

      expect(response.status).toBe(200);
    });
  });
});
