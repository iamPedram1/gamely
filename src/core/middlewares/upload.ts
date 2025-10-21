import multer, { MulterError } from 'multer';
import { BadRequestError } from 'core/utilites/errors';
import { t } from 'core/utilites/request-context';

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

  return (req: any, res: any, next: any) => {
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
            return next(t('messages.file.unexpected_file'));
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

  return (req: any, res: any, next: any) => {
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
            return next(t('messages.file.upload_failed_plural'));
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
