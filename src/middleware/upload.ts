import multer from 'multer';
import { ValidationError } from 'utilites/errors';

const upload = multer({
  storage: multer.memoryStorage(), // ✅ Keep file in memory for Sharp
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else new ValidationError('Provided file is not of type image');
  },
});

export default upload;
