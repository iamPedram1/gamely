import { faker } from '@faker-js/faker';

// Utils
import { adminRoles } from 'features/shared/user/core/user.constant';
import { generateTagService } from 'features/shared/tag/tag.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  sendCreateTagRequest,
  sendDeleteTagRequest,
} from 'features/management/tag/tests/tag.testUtils';
import {
  describe200,
  describe400,
  describe401,
  describe403,
  describe404,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('DELETE /management/tags', () => {
  const tagService = generateTagService();

  let token: string;
  let payload: { tagId: string };

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    const response = await sendCreateTagRequest({ token });

    payload = { tagId: response.body.data?.id as string };
  });

  const exec = async (overwriteToken?: string) =>
    sendDeleteTagRequest(payload.tagId, overwriteToken ?? token);

  describe200(() => {
    it('if role is author and you own the tag', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      payload.tagId = (await sendCreateTagRequest({ token })).body.data
        ?.id as string;

      const response = await exec();

      expect(response.status).toBe(200);
      expect(response.body.isSuccess).toBe(true);
      expect(response.body.message).toMatch(/success/i);
    });

    adminRoles.forEach(async (role) => {
      it(`and delete tag if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const tag = await tagService.getOneById(payload.tagId, {
          throwError: false,
        });

        expect(response.status).toBe(200);
        expect(tag).toBeNull();
        expect(response.body.isSuccess).toBe(true);
      });
    });
  });

  describe400(() => {
    it('if role is author but you dont own the tag', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      const response = await exec();

      expect(response.status).toBe(400);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.message).toMatch(/you didn't/i);
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    it('if role is not [author,admin,superAdmin]', async () => {
      token = (await registerAndLogin())?.accessToken || '';

      const response = await exec();

      expect(response.status).toBe(403);
    });
  });

  describe404(() => {
    it('if tag does not exist', async () => {
      payload.tagId = faker.database.mongodbObjectId();

      const response = await exec();

      expect(response.status).toBe(404);
      expect(response.body.isSuccess).toBe(false);
    });
  });
});
