// Controllers
import FileController from 'api/file/file.controller';

// Services
import FileService from 'api/file/file.service';

export default function createFileModule() {
  const fileService = new FileService();

  const fileController = new FileController(fileService);

  return { fileController };
}
