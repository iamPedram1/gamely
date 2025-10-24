import { delay, inject, injectable } from 'tsyringe';

// Services
import FileService from 'api/file/file.service';

// Utilities
import sendResponse from 'core/utilites/response';

// DTO
import { FileMapper } from 'api/file/file.mapper';

// Types
import type { RequestHandler } from 'express';
import type { IFileLocation } from 'api/file/file.type';

@injectable()
export default class FileController {
  constructor(
    @inject(delay(() => FileMapper)) private fileMapper: FileMapper,
    @inject(delay(() => FileService)) private fileService: FileService
  ) {}

  uploadOne: RequestHandler = async (req, res) => {
    const location = req.params?.location as IFileLocation;
    const file = req.file;

    const doc = await this.fileService.uploadOne(location, file!, req.user?.id);

    sendResponse(res, doc ? 201 : 400, {
      httpMethod: 'POST',
      body: {
        message: doc
          ? req.t('messages.file.upload_success_singular')
          : req.t('messages.file.upload_failed_singular'),
        data: doc ? this.fileMapper.toDto(doc) : null,
      },
    });
  };

  uploadMany: RequestHandler = async (req, res) => {
    const result = await this.fileService.uploadMany(
      req.params?.location as IFileLocation,
      req.files as Express.Multer.File[],
      req.user?.id
    );

    sendResponse(res, result.fails.length === 0 ? 201 : 400, {
      httpMethod: 'POST',
      body: {
        errors: result.fails.map((rejectCount) => rejectCount.reason),
        message:
          result.successes.length > 0 && result.fails.length > 0
            ? req.t('messages.file.upload_some_failed')
            : result.successes.length > 0 && result.fails.length === 0
              ? req.t('messages.file.upload_success_plural')
              : req.t('messages.file.upload_failed_plural'),
        data:
          result.successes.length > 0
            ? result.successes.map((file) => this.fileMapper.toDto(file.value))
            : null,
      },
    });
  };
}
