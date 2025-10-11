import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Models
import File from 'api/file/file.model';

// Services
import BaseService from 'services/base.service.module';

// Utilities
import { BadRequestError } from 'utilites/errors';

// Types
import type { IFileEntity, IFileLocation } from 'api/file/file.type';

export type IFileService = InstanceType<typeof FileService>;

class FileService
  extends BaseService<IFileEntity, undefined, undefined>
  implements IFileService
{
  constructor() {
    super(File);
  }

  async uploadOne(
    location: IFileLocation,
    file: Express.Multer.File,
    userId?: string
  ): Promise<IFileEntity> {
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
      path: path.join('img', path.basename(uploadPath), filename),
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
