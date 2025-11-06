import multer, { MulterError } from 'multer';
import { BadRequestError } from 'core/utilities/errors';
import { t } from 'core/utilities/request-context';
import { NextFunction, Request, Response } from 'express';

type UploadOptions = {
  fieldName: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
};

export const uploadOneFile = ({
  fieldName,
  maxSize = 2 * 1024 * 1024,
}: Omit<UploadOptions, 'maxFiles'>) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize },
  });
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err instanceof MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return next(
              new BadRequestError(
                t('messages.file.too_large', { size: String(maxSize) })
              )
            );
          case 'LIMIT_UNEXPECTED_FILE':
            return next(
              new BadRequestError(t('messages.file.unexpected_file'))
            );
          default:
            return next(new BadRequestError(t('messages.file.upload_failed')));
        }
      }
      if (err)
        return next(new BadRequestError(t('messages.file.upload_failed')));
      next();
    });
  };
};
export const uploadManyFiles = ({
  fieldName,
  maxFiles = 3,
  maxSize = 2 * 1024 * 1024,
}: UploadOptions) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: maxFiles, fileSize: maxSize },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName)(req, res, (err: any) => {
      if (err instanceof MulterError) {
        switch (err.code) {
          case 'LIMIT_UNEXPECTED_FILE':
            return next(
              new BadRequestError(`Unexpected file in field ${fieldName}`)
            );

          case 'LIMIT_FILE_COUNT':
            return next(
              new BadRequestError(
                t('messages.file.too_many_files', { size: String(maxFiles) })
              )
            );

          case 'LIMIT_FILE_SIZE':
            return next(
              new BadRequestError(
                t('messages.file.too_large', { size: String(maxSize) })
              )
            );
          default:
            return next(
              new BadRequestError(t('messages.file.upload_failed_plural'))
            );
        }
      }
      if (err)
        return next(
          new BadRequestError(t('messages.file.upload_failed_plural'))
        );
      next();
    });
  };
};
