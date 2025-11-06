import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';

// Controller
import ReportClientController from 'features/client/report/report.client.controller';
import validateBody from 'core/middlewares/validateBody';
import { CreateReportDto } from 'features/shared/report/report.dto';

// DTO
const reportClientRouter = express.Router();
const reportClientController = container.resolve(ReportClientController);

reportClientRouter.use(auth(['user', 'author', 'admin', 'superAdmin']));

// <----------------   POST   ---------------->
reportClientRouter.post(
  '/',
  validateBody(CreateReportDto),
  reportClientController.report
);

export default reportClientRouter;
