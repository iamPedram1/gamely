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
  describe401,
  describe403,
  describe404,
  expectNotFoundError,
  expectSuccess,
  itShouldOwn,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

describe('DELETE /management/tags', () => {
  const tagService = generateTagService();

  let token: string;
  let tagId: string;

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    tagId = (await sendCreateTagRequest({ token })).body.data!.id;
  });

  const exec = async (overwriteToken?: string) =>
    sendDeleteTagRequest(tagId, overwriteToken ?? token);

  describe200(() => {
    it('if role is author and you own the tag', async () => {
      token = (await registerAndLogin({ role: 'author' }))?.accessToken || '';

      tagId = (await sendCreateTagRequest({ token })).body.data!.id;

      const response = await exec();

      expectSuccess(response, 200, /success/i);
    });

    adminRoles.forEach((role) => {
      it(`and delete tag if role is ${role}`, async () => {
        token = (await registerAndLogin({ role }))?.accessToken || '';

        const response = await exec();
        const tag = await tagService.getOneById(tagId, { throwError: false });

        expect(tag).toBeNull();
        expectSuccess(response, 200, /success/i);
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
    itShouldOwn('author', exec, 'tag');
  });

  describe404(() => {
    it('if tag does not exist', async () => {
      tagId = faker.database.mongodbObjectId();

      const response = await exec();

      expectNotFoundError(response);
    });
  });
});
