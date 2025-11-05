import { container } from 'tsyringe';

// Services
import TagService from 'features/shared/tag/tag.service';

// Utils
import { expectUnauthorizedError } from 'core/utilities/testHelpers';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateTagRequest,
  sendGetTagRequest,
} from 'features/management/tag/tests/tag.testUtils';
import { adminRoles } from 'features/shared/user/core/user.constant';
import { UserRole } from 'features/shared/user/core/user.types';

describe('GET /management/tags', () => {
  let token: string;
  const tagService = container.resolve(TagService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    await sendCreateTagRequest({ token });
  });

  const exec = async () => sendGetTagRequest(token);

  it('should return 401 if user does not have token in header', async () => {
    token = '';

    const response = await exec();

    expectUnauthorizedError(response);
  });

  it('should return 403 if role is not [author,admin,superAdmin]', async () => {
    token = (await registerAndLogin())?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(403);
  });

  describe.each(['author', ...adminRoles] as UserRole[])(
    'should return 200',
    async (role) => {
      it(`if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();

        expect(response.status).toBe(200);
      });
    }
  );

  it('should return pagination if authorized', async () => {
    const response = await exec();

    expect(response.body.data!.pagination).toBeDefined();
    expect(response.body.data!.pagination.totalDocs).toBeGreaterThan(0);
  });

  it('should return docs if authorized', async () => {
    const response = await exec();

    expect(response.body.data!.docs).toBeDefined();
    expect(Array.isArray(response.body.data!.docs)).toBe(true);
    expect(response.body.data!.docs.length).toBeGreaterThan(0);
    expect(response.body.data!.pagination.totalDocs).toBeGreaterThan(0);

    ['translations', 'slug', 'id'].forEach((key) => {
      expect(response.body.data!.docs[0]).toHaveProperty(key);
    });
  });
});
