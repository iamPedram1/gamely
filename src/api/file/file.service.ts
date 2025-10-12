import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { singleton } from 'tsyringe';
import type { DeleteResult } from 'mongoose';

// Models
import File, { FileDocument } from 'api/file/file.model';

// Services
import BaseService from 'services/base.service.module';

// Utilities
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from 'utilites/errors';

// Types
import type { BaseMutateOptions } from 'services/base.service.type';
import type { IFileEntity, IFileLocation } from 'api/file/file.type';

export type IFileService = InstanceType<typeof FileService>;

@singleton()
class FileService extends BaseService<IFileEntity, undefined, undefined> {
  constructor() {
    super(File);
  }

  async deleteOneById(
    id: string,
    options?: BaseMutateOptions
  ): Promise<DeleteResult> {
    const file = await super.getOneById(id, { lean: true });
    if (!file) throw new NotFoundError('File with the given id was not found.');

    try {
      await fsPromises.access(file.path);
      await fsPromises.rm(file.path);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw new InternalServerError(
          err?.message || 'An error occurred while deleting file.'
        );
      }
    }

    const result = await super.deleteOneById(id, options);
    if (result.deletedCount === 0)
      throw new InternalServerError(
        'An unexpected error occured while deleting file.'
      );

    return result;
  }

  async uploadOne(
    location: IFileLocation,
    file: Express.Multer.File,
    userId?: string
  ): Promise<FileDocument> {
    if (!file) throw new BadRequestError('No file provided.');
    if (!location) throw new BadRequestError('No location provided.');

    // ✅ Compute destination folder
    const folderMap: Record<IFileLocation, string> = {
      game: 'public/images/games',
      user: 'public/images/users',
      post: 'public/images/posts',
    };

    const uploadPath = folderMap[location];
    if (!uploadPath) throw new BadRequestError('Invalid location provided.');

    // ✅ Ensure directory exists
    const absolutePath = path.join(process.cwd(), uploadPath);
    if (!fs.existsSync(absolutePath))
      fs.mkdirSync(absolutePath, { recursive: true });

    // ✅ Process image with Sharp
    const nameWithoutExt = path.parse(file.originalname).name;
    const safeName = nameWithoutExt.replace(/\s+/g, '-').toLowerCase(); // 3-001
    const filename = `${Date.now()}-${safeName}.webp`;
    const filepath = path.join(uploadPath, filename);

    await sharp(file.buffer).webp().toFile(filepath);

    // ✅ Save file metadata in DB
    const doc = await new File({
      filename,
      destination: uploadPath,
      path: path.join('images', path.basename(uploadPath), filename),
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
      location,
      ...(userId && { creator: userId }),
    }).save();

    if (!doc) throw new BadRequestError('Uploading image failed.');

    return doc;
  }
}

export default FileService;
