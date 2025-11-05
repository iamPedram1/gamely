import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

// Services
import TagService from 'features/shared/tag/tag.service';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { expectUnauthorizedError } from 'core/utilities/testHelpers';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateTagRequest,
  sendDeleteTagRequest,
} from 'features/management/tag/tests/tag.testUtils';

describe('DELETE /management/tags', () => {
  const tagService = container.resolve(TagService);

  let token: string;
  let payload: { tagId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateTagRequest({ token });

    payload = { tagId: response.body.data!.id };
  });

  const exec = async () => sendDeleteTagRequest(payload.tagId, token);

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

  it('should return 400 if role is author but you dont own the tag', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    const response = await exec();

    expect(response.status).toBe(400);
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.message).toMatch(/you didn't/i);
  });

  it('should return 200 if role is author and you own the tag', async () => {
    token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

    payload.tagId = (await sendCreateTagRequest({ token })).body.data!.id;

    const response = await exec();

    expect(response.status).toBe(200);
    expect(response.body.isSuccess).toBe(true);
    expect(response.body.message).toMatch(/success/i);
  });

  describe.each(adminRoles)(
    'should return 200 and delete tag if',
    async (role) => {
      it(`role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const tag = await tagService.getOneById(payload.tagId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(tag).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    }
  );

  it('should return 404 if tag does not exist', async () => {
    payload.tagId = faker.database.mongodbObjectId();

    const response = await exec();

    expect(response.status).toBe(404);
    expect(response.body.isSuccess).toBe(false);
  });
});
