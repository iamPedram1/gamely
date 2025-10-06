// Model
import {
  CategoryDocument,
  CategoryLeanDocument,
} from 'api/category/category.model';

// Dto
import {
  CategoryResponseDto,
  CategorySummaryResponseDto,
  NestedCategoryResponseDto,
} from 'api/category/category.dto';

// Mapper
import { BaseMapper } from 'mapper/base';
import { INestedCategory } from 'api/category/category.type';
import { plainToInstance } from 'class-transformer';

export interface ICategoryMapper {
  toNestedDto: (category: INestedCategory) => NestedCategoryResponseDto;
  toDto: (
    category: CategoryDocument | CategoryLeanDocument
  ) => CategoryResponseDto;
  toSummaryDto: (
    category: CategoryDocument | CategoryLeanDocument
  ) => CategorySummaryResponseDto;
}

export class CategoryMapper
  extends BaseMapper<
    CategoryDocument,
    CategoryLeanDocument,
    CategoryResponseDto,
    CategorySummaryResponseDto
  >
  implements ICategoryMapper
{
  constructor() {
    super(CategoryResponseDto, CategorySummaryResponseDto);
  }

  toNestedDto(doc: INestedCategory) {
    return plainToInstance(NestedCategoryResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}
