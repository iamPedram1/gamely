import { container } from 'tsyringe';

// Services
import FileService from 'features/shared/file/file.service';

// Utilities
import { fileLocations } from 'features/shared/file/file.constant';
import { registerAndLogin } from 'features/shared/auth/core/tests/auth.testUtils';
import { sendMultipleUploadFileRequest } from 'features/shared/file/test/file.testUtils';

// Types
import { FileLocationType } from 'features/shared/file/file.types';

describe('POST /files/:location/batch', () => {
  let token: string;
  let fileCount = 1;
  let location: FileLocationType;
  let fileService = container.resolve(FileService);

  beforeEach(async () => {
    token = (await registerAndLogin())?.accessToken || '';
    location = 'post';
    fileCount = 2;
  });

  const exec = async () =>
    sendMultipleUploadFileRequest({
      count: fileCount,
      payload: location,
      token,
    });

  describe.each(fileLocations)(
    'should upload multiple files successfully',
    (locationOption) => {
      it(`when location is ${locationOption}`, async () => {
        location = locationOption;
        const res = await exec();

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data!.length).toBe(fileCount);

        for (let file of res.body.data || []) {
          expect(await fileService.existsById(file.id)).toBe(true);
          expect(file.id).toBeDefined();
          expect(file.location).toBe(location);
          expect(file.url).toBeDefined();
          expect(file.updateDate).toBeNull();
          expect(file.filename).toBeDefined();
        }
      });
    }
  );

  describe.each(fileLocations)(
    'should also upload single files',
    (locationOption) => {
      it(`when location is ${locationOption}`, async () => {
        location = locationOption;
        fileCount = 1;
        const res = await exec();

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data!.length).toBe(fileCount);

        for (let file of res.body.data || []) {
          expect(await fileService.existsById(file.id)).toBe(true);
          expect(file.id).toBeDefined();
          expect(file.location).toBe(location);
          expect(file.url).toBeDefined();
          expect(file.updateDate).toBeNull();
          expect(file.filename).toBeDefined();
        }
      });
    }
  );
});
