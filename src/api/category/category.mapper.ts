import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

// Model
import {
  CategoryDocument,
  CategoryLeanDocument,
} from 'api/category/category.model';

// DTO
import {
  CategoryResponseDto,
  CategorySummaryResponseDto,
  NestedCategoryResponseDto,
} from 'api/category/category.dto';

// Mapper
import { BaseMapper } from 'core/mappers/deprecated.base';
import {
  INestedCategory,
  INestedCategoryEntity,
} from 'api/category/category.type';

export type ICategoryMapper = InstanceType<typeof CategoryMapper>;

@singleton()
export class CategoryMapper extends BaseMapper<
  CategoryDocument,
  CategoryLeanDocument,
  CategoryResponseDto,
  CategorySummaryResponseDto
> {
  constructor() {
    super(CategoryResponseDto, CategorySummaryResponseDto);
  }

  toNestedDto(doc: INestedCategory | INestedCategoryEntity) {
    return plainToInstance(NestedCategoryResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}
