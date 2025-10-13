import server from 'app';
import request from 'supertest';
import mongoose from 'mongoose';

// Models
import Game from 'api/game/game.model';
import User from 'api/user/user.model';

// Utils
import { prefixBaseUrl, jwtTokenName } from 'utilites/configs';

// Types
import { IGameEntity } from 'api/game/game.type';

describe('game routes', () => {
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /', () => {
    let token: string;
    let userId: string;
    let payload: Pick<IGameEntity, 'title' | 'slug'> = {
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
      token = user.generateToken();
      payload = { title: 'Red Dead Redemption 2', slug: 'rdr2' };
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Game.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .post(prefixBaseUrl('/games'))
        .set(jwtTokenName, token)
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
      await new Game({ ...payload, creator: userId }).save();

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
    let gameId: string;
    let userId: string;
    let payload: Pick<IGameEntity, 'title' | 'slug'> = {
      slug: '',
      title: '',
    };

    beforeEach(async () => {
      const user = await new User({
        email: 'test@gmail.com',
        password: '123456789',
        name: 'Test',
      }).save();

      gameId = '';
      userId = user._id.toHexString();
      token = user.generateToken();
      payload = { title: 'Red Dead Redemption 2', slug: 'rdr2' };
      const game = await new Game({ ...payload, creator: userId }).save();
      gameId = game._id.toHexString();
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Game.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .patch(prefixBaseUrl(`/games/${gameId}`))
        .set(jwtTokenName, token)
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
      const newGame = await new Game({
        title: 'Drama',
        slug: 'drama',
        creator: userId,
      }).save();

      payload.slug = newGame.slug;
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
    let gameId: string = '';
    let userId: string = '';

    beforeEach(async () => {
      const user = await new User({
        email: 'test@gmail.com',
        password: '123456789',
        name: 'Test',
      }).save();
      userId = user._id.toHexString();
      token = user.generateToken();
      const game = await new Game({
        title: 'Red Dead Redemption 2',
        slug: 'rdr2',
        creator: userId,
      }).save();
      gameId = game._id.toHexString();
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Game.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .delete(prefixBaseUrl(`/games/${gameId}`))
        .set(jwtTokenName, token)
        .send();
    };

    it('should return 401 if no token passed', async () => {
      token = '';

      const response = await exec();

      expect(response.status).toBe(401);
    });

    it('should return 400 if invalid id passed', async () => {
      gameId = 'abcdefg';

      const response = await exec();

      expect(response.status).toBe(400);
    });

    it('should return 404 if game id dosent exist', async () => {
      gameId = new mongoose.Types.ObjectId().toHexString();

      const response = await exec();

      expect(response.status).toBe(404);
    });

    it('should remove the game if id is valid', async () => {
      const response = await exec();

      expect(response.status).toBe(200);
    });
  });
});
