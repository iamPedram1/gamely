import { faker } from '@faker-js/faker';

// Utils
import tokenUtils from 'core/services/token.service';
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  generatePostData,
  sendCreatePostRequest,
} from 'features/management/post/core/tests/post.testUtils';
import {
  describe201,
  describe400,
  describe401,
  describe403,
  expectBadRequest,
  expectNotFoundError,
  itShouldRequireManagementRole,
  itShouldRequireToken,
} from 'core/utilities/testHelpers';

// DTO
import { CreatePostDto } from 'features/management/post/core/post.management.dto';
import { generatePostService } from 'features/shared/post/core/post.constant';
import { generateUserService } from 'features/shared/user/core/user.constant';

// Types
import type { IAccessToken } from 'features/shared/auth/session/session.types';

describe('POST /management/posts', () => {
  let token: string;
  let payload: CreatePostDto;
  const postService = generatePostService();
  const userService = generateUserService();

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    payload = await generatePostData(token);
  });

  const exec = async (overwriteToken?: string) => {
    return await sendCreatePostRequest({
      payload,
      token: overwriteToken ?? token,
    });
  };

  describe201(() => {
    it('if the payload is valid', async () => {
      const response = await exec();
      const post = await postService.getOneBySlug(payload.slug, { lean: true });
      const { userId } = tokenUtils.decode<IAccessToken>(token);

      expect(response.status).toBe(201);
      expect(post).toBeDefined();

      expect(post.translations).toMatchObject(payload.translations);

      expect(String(post.game)).toBe(payload.game);
      expect(String(post.creator)).toBe(userId);
      expect(String(post.category)).toBe(payload.category);
      expect(post.tags.length).toBe(payload.tags.length);
      expect(post.coverImage).toBeDefined();
      expect(String(post.coverImage)).toBe(payload.coverImage);
      expect(post.readingTime).toBe(payload.readingTime);

      payload.tags.forEach((tag) => {
        expect(post.tags.map(String)).toContain(tag);
      });
    });
  });

  describe400(() => {
    it('if the slug is already taken', async () => {
      const post = await sendCreatePostRequest({ token });
      payload.slug = post.body.data!.slug;

      const response = await exec();

      expectBadRequest(response, /taken/i);
    });

    (['title', 'abstract', 'content'] as const).forEach((key) => {
      appLanguages.forEach((lang) => {
        it(`if ${key} validations fails in translations[${lang}]`, async () => {
          payload = await generatePostData(token);
          payload.translations[lang][key] = '';
          const response = await exec();
          expectBadRequest(response, new RegExp(key, 'i'));
        });
      });
    });
  });

  describe401(() => {
    itShouldRequireToken(exec);
  });

  describe403(() => {
    itShouldRequireManagementRole(exec);
  });

  describe('should return 404', () => {
    for (let key of ['game', 'coverImage', 'category', 'tags'] as const) {
      it(`if ${key} is not valid`, async () => {
        if (key === 'tags') payload[key] = [faker.database.mongodbObjectId()];
        else payload[key] = faker.database.mongodbObjectId();

        const response = await exec();

        expectNotFoundError(
          response,
          new RegExp(key === 'tags' ? 'tag' : key, 'i')
        );
      });
    }

    (['title', 'abstract', 'content'] as const).forEach((key) => {
      appLanguages.forEach((lang) => {
        it(`fails for ${lang}`, async () => {
          payload = await generatePostData(token);
          payload.translations[lang][key] = '';
          const response = await exec();
          expectBadRequest(response, new RegExp(key, 'i'));
        });
      });
    });
  });
});
