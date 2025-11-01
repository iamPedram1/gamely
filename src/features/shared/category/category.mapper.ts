import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

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
import type {
  INestedCategoryEntity,
  ICategoryEntity,
} from 'features/shared/category/category.types';

export type ICategoryMapper = InstanceType<typeof CategoryMapper>;

@singleton()
export class CategoryMapper extends BaseMapper<
  ICategoryEntity,
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
