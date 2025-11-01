import { singleton } from 'tsyringe';

// DTO
import { ReportManagementResponseDto } from 'features/management/report/report.management.dto';

// Mapper
import { AbstractMapper } from 'core/mappers/base';

// Types
import type {
  ReportDocument,
  ReportLeanDocument,
} from 'features/shared/report/report.types';

export type IReportMapper = InstanceType<typeof ReportMapper>;

@singleton()
export class ReportMapper extends AbstractMapper<
  ReportDocument,
  ReportLeanDocument
> {
  toReportDto(entity: ReportDocument | ReportLeanDocument) {
    return this.toInstance(ReportManagementResponseDto, entity);
  }
}
