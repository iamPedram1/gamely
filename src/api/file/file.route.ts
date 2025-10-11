import express from 'express';

// Middlewares
import auth from 'middleware/auth';
import upload from 'middleware/upload';

// Module
import createFileModule from 'api/file/file.module';

// Dto
const fileRouter = express.Router();
const { fileController } = createFileModule();

// Public Routes
fileRouter.use(auth);
fileRouter.post('/:location', upload.single('image'), fileController.uploadOne);

export default fileRouter;
