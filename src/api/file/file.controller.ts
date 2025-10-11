import type { RequestHandler } from 'express';

// Utilities
import sendResponse from 'utilites/response';

// Types
import type { IFileService } from 'api/file/file.service';

export default class FileController {
  private fileService: IFileService;

  constructor(fileService: IFileService) {
    this.fileService = fileService;
  }

  uploadOne: RequestHandler = async (req, res) => {
    const location = req.params?.location as any;
    const file = req.file;

    const doc = await this.fileService.uploadOne(
      location,
      file!,
      req.user?._id
    );

    sendResponse(res, 200, {
      httpMethod: 'POST',
      featureName: 'File Upload successfully',
      body: { data: doc },
    });
  };
}
