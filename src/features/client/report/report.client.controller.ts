import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import ReportService from 'features/shared/report/report.service';

// DTO
import { CreateReportDto } from 'features/shared/report/report.dto';

// Utilities
import sendResponse from 'core/utilities/response';

@injectable()
export default class ReportClientController {
  constructor(
    @inject(delay(() => ReportService))
    private reportService: ReportService
  ) {}

  report: RequestHandler = async (req, res) => {
    const dto = req.body as unknown as CreateReportDto;

    await this.reportService.report(dto, { lean: true });

    sendResponse(res, 201, {
      httpMethod: 'POST',
      featureName: 'models.Report.singular',
    });
  };
}
