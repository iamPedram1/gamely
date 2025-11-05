import { container } from 'tsyringe';

// Services
import TagService from 'features/shared/tag/tag.service';

// Utils
import { appLanguages } from 'core/startup/i18n';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import {
  generateTag,
  sendCreateTagRequest,
} from 'features/management/tag/tests/tag.testUtils';
import {
  expectBadRequest,
  expectUnauthorizedError,
} from 'core/utilities/testHelpers';

// DTO
import { CreateTagDto } from 'features/management/tag/tag.management.dto';

describe('POST /management/tags', () => {
  let token: string;
  let payload: CreateTagDto;
  const tagService = container.resolve(TagService);

  beforeEach(async () => {
    payload = generateTag();

    token = (await registerAndLogin({ role: 'admin' }))!.accessToken;
  });

  const exec = async () => sendCreateTagRequest({ payload, token });

  it('should return 401 if user does not have token in header', async () => {
    token = '';

    const response = await exec();

    expectUnauthorizedError(response);
  });

  it('should return 403 if role is not [author,admin,superAdmin]', async () => {
    token = (await registerAndLogin())!.accessToken;

    const response = await exec();

    expect(response.status).toBe(403);
  });

  it('should return 400 if the slug is already taken', async () => {
    const tag = await sendCreateTagRequest({ token });
    payload.slug = tag.body.data!.slug;

    const response = await exec();

    expectBadRequest(response, /taken/i);
  });

  describe.each(appLanguages)(
    'should return 400 if translations.%s.title is not valid',
    (lang) => {
      it(`fails for ${lang}`, async () => {
        payload.translations[lang].title = 'ab';
        const response = await exec();
        expectBadRequest(response, /title/i);
      });
    }
  );

  it('should return 201 if the payload is valid', async () => {
    const response = await exec();
    const tag = await tagService.getOneBySlug(payload.slug);

    expect(response.status).toBe(201);
    expect(tag).toBeDefined();
    expect(tag).toMatchObject(payload);
  });
});
