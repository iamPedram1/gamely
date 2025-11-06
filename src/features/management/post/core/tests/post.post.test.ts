import { container } from 'tsyringe';

// Services
import PostService from 'features/shared/post/core/post.service';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  generatePost,
  sendCreatePostRequest,
} from 'features/management/post/core/tests/post.testUtils';
import {
  expectBadRequest,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// DTO
import { CreatePostDto } from 'features/management/post/core/post.management.dto';
import UserService from 'features/shared/user/core/user.service';
import tokenUtils from 'core/services/token.service';
import { IAccessToken } from 'features/shared/auth/session/session.types';
import { sendUploadFileRequest } from 'features/shared/file/test/file.testUtils';

describe('POST /management/posts', () => {
  let token: string;
  let payload: CreatePostDto;
  const postService = container.resolve(PostService);
  const userService = container.resolve(UserService);

  beforeEach(async () => {
    token = (await registerAndLogin({ role: 'admin' }))?.accessToken || '';

    payload = await generatePost(token);
  });

  const exec = async () => {
    console.log(payload, token);
    return await sendCreatePostRequest({ payload, token });
  };

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

  it('should return 400 if the slug is already taken', async () => {
    const post = await sendCreatePostRequest({ token });
    payload.slug = post.body.data!.slug;

    const response = await exec();

    expectBadRequest(response, /taken/i);
  });

  describe.each(['title', 'abstract', 'content'] as const)(
    'should return 400',
    (key) => {
      describe.each(appLanguages)(
        `if translations.%s.${key} is not valid`,
        (lang) => {
          it(`fails for ${lang}`, async () => {
            payload = await generatePost(token);
            payload.translations[lang][key] = '';
            const response = await exec();
            expectBadRequest(response, new RegExp(key, 'i'));
          });
        }
      );
    }
  );

  it('should return 201 if the payload is valid', async () => {
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

function test() {}
