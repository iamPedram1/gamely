// Utilities
import { fileLocations } from 'features/shared/file/file.constant';
import {
  registerAndLogin,
  sendUploadFileRequest,
} from 'core/utilities/testHelpers';

// Types
import { FileLocationType } from 'features/shared/file/file.types';

describe('POST /files/:location', () => {
  let token: string;
  let fileCount = 1;
  let location: FileLocationType;

  beforeEach(async () => {
    const user = await registerAndLogin();
    location = 'post';
    fileCount = 1;
    token = user!.accessToken;
  });

  const exec = async () =>
    sendUploadFileRequest({
      token,
      payload: location,
      noFile: fileCount === 0,
    });

  describe.each(fileLocations)(
    'should upload a single file successfully',
    (locationOption) => {
      it(`when location is ${locationOption}`, async () => {
        location = locationOption;
        fileCount = 1;

        const res = await exec();

        expect(res.statusCode).toBe(201);
        expect(typeof res.body.data).toBe('object');
        expect(res.body.data!.id).toBeDefined();
        expect(res.body.data!.location).toBe(locationOption);
        expect(res.body.data!.url).toBeDefined();
        expect(res.body.data!.updateDate).toBeNull();
        expect(res.body.data!.filename).toBeDefined();
      });
    }
  );

  it('should fail if file not provided', async () => {
    fileCount = 0;

    const res = await exec();

    expect(res.statusCode).toBe(400);
  });

  it('should fail for invalid location', async () => {
    location = 'invalidLocation' as any;

    const res = await exec();

    expect(res.statusCode).toBe(400);
  });
});
