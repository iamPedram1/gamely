import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { singleton } from 'tsyringe';

// Models
import File from 'features/shared/file/file.model';

// Services
import BaseService from 'core/services/base/base.service';

// Utilities
import { AnonymousError, BadRequestError } from 'core/utilities/errors';

// Types
import type { DocumentId } from 'core/types/common';
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type {
  IFileEntity,
  FileLocationType,
  FileDocument,
} from 'features/shared/file/file.types';

export type IFileService = InstanceType<typeof FileService>;

@singleton()
class FileService extends BaseService<IFileEntity> {
  constructor() {
    super(File);
  }

  async deleteOneById(
    id: DocumentId,
    options?: BaseMutateOptions
  ): Promise<true> {
    const file = await super.getOneById(id, { lean: true });
    const result = await super.deleteOneById(id, options);

    try {
      await fsPromises.access(file.path);
      await fsPromises.rm(file.path);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw new AnonymousError(err?.message);
      }
    }

    return result;
  }

  async uploadOne(
    location: FileLocationType,
    file: Express.Multer.File,
    userId?: string
  ): Promise<FileDocument> {
    if (!file) throw new BadRequestError(this.t('messages.file.not_provided'));
    if (!location)
      throw new BadRequestError(this.t('messages.file.location_not_provided'));

    // ✅ Compute destination folder
    const folderMap: Record<FileLocationType, string> = {
      game: 'public/images/games',
      user: 'public/images/users',
      post: 'public/images/posts',
    };

    const uploadPath = folderMap[location];

    if (!uploadPath)
      throw new BadRequestError(this.t('messages.file.location_invalid'));

    // Ensure directory exists
    const absolutePath = path.join(process.cwd(), uploadPath);
    if (!fs.existsSync(absolutePath))
      fs.mkdirSync(absolutePath, { recursive: true });

    // Process image with Sharp
    const nameWithoutExt = path.parse(file.originalname).name;
    const safeName = nameWithoutExt.replace(/\s+/g, '-').toLowerCase(); // 3-001
    const filename = `${Date.now()}-${safeName}.webp`;
    const filepath = path.join(uploadPath, filename);

    await sharp(file.buffer).webp().toFile(filepath);

    // Save file metadata in DB
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

    if (!doc) throw new BadRequestError(this.t('messages.file.upload_failed'));

    return doc;
  }

  async uploadMany(
    location: FileLocationType,
    files: Express.Multer.File[],
    userId?: string
  ) {
    const result = await Promise.allSettled(
      files.map((file) => this.uploadOne(location, file, userId))
    );

    const successes: PromiseFulfilledResult<FileDocument>[] = [];
    const fails: PromiseRejectedResult[] = [];

    for (let res of result) {
      if (res.status === 'fulfilled') successes.push(res);
      else fails.push(res);
    }

    return { successes, fails };
  }
}

export default FileService;
