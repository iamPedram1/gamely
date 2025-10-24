import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import { uploadManyFiles, uploadOneFile } from 'core/middlewares/upload';

// Module
import FileController from 'api/file/file.controller';

// DTO
const fileRouter = express.Router();
const fileController = container.resolve(FileController);

// Public Routes
fileRouter.use(auth(['user', 'author', 'admin']));
fileRouter.post(
  '/:location/batch',
  uploadManyFiles({ fieldName: 'image', maxFiles: 4 }),
  fileController.uploadMany
);
fileRouter.post(
  '/:location',
  uploadOneFile({ fieldName: 'image' }),
  fileController.uploadOne
);

export default fileRouter;
