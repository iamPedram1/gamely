import express from 'express';
import { container } from 'tsyringe';

// Middlewares
import auth from 'core/middlewares/auth';
import { softValidateQuery } from 'core/middlewares/validateQuery';

// Model
import Report from 'features/shared/report/report.model';

// Controller
import ReportManagementController from 'features/management/report/report.management.controller';

// DTO
import { validateParam } from 'core/middlewares/validations';
import { ReportManagementQueryDto } from 'features/management/report/report.management.dto';

const reportManagementRouter = express.Router();
const reportManagementController = container.resolve(
  ReportManagementController
);

reportManagementRouter.use(auth(['admin', 'superAdmin']));

// <----------------   GET   ---------------->
reportManagementRouter.get('/overview', reportManagementController.getOverview);
reportManagementRouter.get(
  '/',
  softValidateQuery(ReportManagementQueryDto),
  reportManagementController.getReports
);

// <----------------   PATCH   ---------------->
reportManagementRouter.patch(
  '/:id',
  validateParam(Report, 'id', '_id', { type: 'id' }),
  reportManagementController.updateReport
);

export default reportManagementRouter;
