import { container } from 'tsyringe';

// Services
import GameService from 'features/shared/game/core/game.service';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateGameRequest,
  sendGetGameRequest,
} from 'features/management/game/tests/game.testUtils';

// Types
import { UserRole } from 'features/shared/user/core/user.types';

describe('GET /management/games', () => {
  let token: string;

  const gameService = container.resolve(GameService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    await sendCreateGameRequest({ token });
  });

  const exec = async () => sendGetGameRequest(token);

  it('should return 403 if role is not [author,admin,superAdmin]', async () => {
    token = (await registerAndLogin())?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(403);
  });

  describe.each(['author', ...adminRoles] as Exclude<UserRole, 'user'>[])(
    'should return 200',
    (role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    }
  );

  it('should return pagination if authorized', async () => {
    const response = await exec();

    expect(response.body.data?.pagination).toBeDefined();
    expect(response.body.data?.pagination.totalDocs).toBeGreaterThan(0);
  });

  it('should return docs if authorized', async () => {
    const response = await exec();

    expect(response.body.data?.docs).toBeDefined();
    expect(Array.isArray(response.body.data?.docs)).toBe(true);
    expect(response.body.data?.docs.length).toBeGreaterThan(0);
    expect(response.body.data?.pagination.totalDocs).toBeGreaterThan(0);

    ['translations', 'slug', 'id'].forEach((key) => {
      expect(response.body.data?.docs[0]).toHaveProperty(key);
    });
  });
});
