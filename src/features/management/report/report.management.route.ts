import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import { softValidateQuery } from 'core/middlewares/validateQuery';

// Controller
import ReportManagementController from 'features/management/report/report.management.controller';

// DTO
import { ReportManagementQueryDto } from 'features/management/report/report.management.dto';

const reportManagementRouter = express.Router();
const reportManagementController = container.resolve(
  ReportManagementController
);

const accessMiddleware = auth(['admin', 'superAdmin']);

// <----------------   POST   ---------------->
reportManagementRouter.get(
  '/',
  accessMiddleware,
  softValidateQuery(ReportManagementQueryDto),
  reportManagementController.getReports
);

export default reportManagementRouter;
