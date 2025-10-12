import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'middleware/auth';
import upload from 'middleware/upload';

// Module
import FileController from 'api/file/file.controller';

// Dto
const fileRouter = express.Router();
const fileController = container.resolve(FileController);

// Public Routes
fileRouter.use(auth);
fileRouter.post('/:location', upload.single('image'), fileController.uploadOne);

export default fileRouter;
