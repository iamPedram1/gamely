import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

// Model
import {
  CategoryDocument,
  CategoryLeanDocument,
} from 'features/shared/category/category.model';

// DTO
import {
  CategoryClientResponseDto,
  CategoryClientSummaryResponseDto,
  NestedCategoryClientResponseDto,
} from 'features/client/category/category.client.dto';
import {
  CategoryManagementResponseDto,
  CategoryManagementSummaryResponseDto,
} from 'features/management/category/category.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';
import { INestedCategoryEntity } from 'features/shared/category/category.type';

export type ICategoryMapper = InstanceType<typeof CategoryMapper>;

@singleton()
export class CategoryMapper extends BaseMapper<
  CategoryDocument,
  CategoryLeanDocument,
  CategoryClientResponseDto,
  CategoryManagementResponseDto,
  CategoryClientSummaryResponseDto,
  CategoryManagementSummaryResponseDto
> {
  constructor() {
    super(
      CategoryClientResponseDto,
      CategoryManagementResponseDto,
      CategoryClientSummaryResponseDto,
      CategoryManagementSummaryResponseDto
    );
  }

  toNestedDto(doc: INestedCategoryEntity) {
    return plainToInstance(NestedCategoryClientResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}
