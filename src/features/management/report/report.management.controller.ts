import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import ReportService from 'features/shared/report/report.service';

// DTO
import { CreateReportDto } from 'features/shared/report/report.dto';

// Utilities
import sendResponse from 'core/utilities/response';
import { ReportMapper } from 'features/shared/report/report.mapper';
import { ReportManagementQueryDto } from 'features/management/report/report.management.dto';

@injectable()
export default class ReportManagementController {
  constructor(
    @inject(delay(() => ReportService))
    private reportService: ReportService,
    @inject(delay(() => ReportMapper))
    private reportMapper: ReportMapper
  ) {}

  updateReport: RequestHandler = async (req, res) => {
    const dto = req.body as unknown as CreateReportDto;

    await this.reportService.report(dto, { lean: true });

    sendResponse(res, 204);
  };

  getReports: RequestHandler = async (req, res) => {
    const query = req.query as unknown as ReportManagementQueryDto;
    const filter = await this.reportService.buildFilterFromQuery(query, {
      filterBy: [
        {
          queryKey: 'reason',
          modelKey: 'reason',
          logic: 'and',
        },
        {
          queryKey: 'type',
          modelKey: 'type',
          logic: 'and',
        },
        {
          queryKey: 'status',
          modelKey: 'status',
          logic: 'and',
        },
        { logic: 'and', queryKey: 'user', modelKey: 'user' },
      ],
      searchBy: [
        {
          queryKey: 'search',
          modelKeys: ['description'],
          options: 'i',
        },
      ],
    });

    const reports = await this.reportService.getReports({ filter });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.Report.plural',
      body: {
        data: {
          pagination: reports.pagination,
          docs: reports.docs.map((doc) => this.reportMapper.toReportDto(doc)),
        },
      },
    });
  };
}
