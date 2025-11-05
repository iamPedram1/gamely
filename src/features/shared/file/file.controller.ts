import { delay, inject, injectable } from 'tsyringe';

// Services
import FileService from 'features/shared/file/file.service';

// Utilities
import sendResponse from 'core/utilities/response';

// DTO
import { FileMapper } from 'features/shared/file/file.mapper';

// Types
import type { RequestHandler } from 'express';
import type { FileLocationType } from 'features/shared/file/file.types';

@injectable()
export default class FileController {
  constructor(
    @inject(delay(() => FileMapper)) private fileMapper: FileMapper,
    @inject(delay(() => FileService)) private fileService: FileService
  ) {}

  uploadOne: RequestHandler = async (req, res) => {
    const location = req.params?.location as FileLocationType;
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
      req.params?.location as FileLocationType,
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
