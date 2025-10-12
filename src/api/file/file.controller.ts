import { delay, inject, injectable } from 'tsyringe';

// Services
import FileService from 'api/file/file.service';

// Utilities
import sendResponse from 'utilites/response';

// Dto
import { FileMapper } from 'api/file/file.mapper';

// Types
import type { RequestHandler } from 'express';

@injectable()
export default class FileController {
  constructor(
    @inject(delay(() => FileMapper)) private fileMapper: FileMapper,
    @inject(delay(() => FileService)) private fileService: FileService
  ) {}

  uploadOne: RequestHandler = async (req, res) => {
    const location = req.params?.location as any;
    const file = req.file;

    const doc = await this.fileService.uploadOne(
      location,
      file!,
      req.user?._id
    );

    sendResponse(res, doc ? 201 : 400, {
      httpMethod: 'POST',
      body: {
        message: doc ? 'File uploaded successfully' : 'File upload failed',
        data: doc ? this.fileMapper.toDto(doc) : null,
      },
    });
  };
}
