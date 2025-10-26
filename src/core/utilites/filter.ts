import type { FilterQuery, Model } from 'mongoose';
import type {
  ArrayRule,
  BuildQuery,
  ExistsRule,
  FilterRule,
  RangeRule,
  SearchRule,
} from 'core/types/base.service.type';

// ============================================================================
// Filter Builder - Main Class
// ============================================================================

export class QueryFilterBuilder<TSchema> {
  private $and: FilterQuery<TSchema>[] = [];
  private $or: FilterQuery<TSchema>[] = [];

  constructor(
    private query: Record<string, any>,
    private rules: BuildQuery<any, TSchema>
  ) {}

  /**
   * Main entry point - builds the complete filter
   */
  public async build(): Promise<FilterQuery<TSchema>> {
    await this.processFilters();
    this.processSearchFilters();
    this.processRangeFilters();
    this.processExistsFilters();
    this.processArrayFilters();

    return this.mergeConditions();
  }

  // ==========================================================================
  // Filter Processors
  // ==========================================================================

  private async processFilters(): Promise<void> {
    for (const rule of this.rules.filterBy ?? []) {
      const condition = await this.buildFilterCondition(rule);
      if (!condition) continue;

      const logic = rule.logic ?? 'and'; // Default to AND
      if (logic === 'or') {
        this.$or.push(condition);
      } else {
        this.$and.push(condition);
      }
    }
  }

  private processSearchFilters(): void {
    for (const rule of this.rules.searchBy ?? []) {
      const conditions = this.buildSearchConditions(rule);

      if (conditions.length > 0) {
        const operator = rule.operator ?? 'or';
        if (operator === 'or') {
          this.$or.push(...conditions);
        } else {
          this.$and.push(...conditions);
        }
      }
    }
  }

  private processRangeFilters(): void {
    for (const rule of this.rules.rangeBy ?? []) {
      const condition = this.buildRangeCondition(rule);
      if (condition) this.$and.push(condition);
    }
  }

  private processExistsFilters(): void {
    for (const rule of this.rules.existsBy ?? []) {
      const condition = this.buildExistsCondition(rule);
      if (condition) this.$and.push(condition);
    }
  }

  private processArrayFilters(): void {
    for (const rule of this.rules.arrayBy ?? []) {
      const condition = this.buildArrayCondition(rule);
      if (condition) this.$and.push(condition);
    }
  }

  // ==========================================================================
  // Condition Builders
  // ==========================================================================

  private async buildFilterCondition(
    rule: FilterRule<any, any>
  ): Promise<FilterQuery<TSchema> | null> {
    const value = this.query[rule.queryKey];
    if (ValueHelper.isEmpty(value)) return null;

    const transformedValue = rule.transform
      ? await rule.transform(value)
      : value;
    const operator = rule.operator ?? '$eq';

    return {
      [rule.modelKey]: this.buildOperatorCondition(operator, transformedValue),
    } as FilterQuery<TSchema>;
  }

  private buildOperatorCondition(operator: string, value: any): any {
    // Handle array operators
    const allowedOps = [
      '$eq',
      '$ne',
      '$in',
      '$nin',
      '$gte',
      '$lte',
      '$all',
      '$elemMatch',
      '$size',
    ];
    if (!allowedOps.includes(operator)) throw new Error('Invalid operator');

    if (operator === '$in' || operator === '$nin') {
      return {
        [operator]: Array.isArray(value) ? value : [value],
      };
    }

    // Handle default equality (backwards compatibility)
    if (operator === '$eq') {
      return Array.isArray(value) ? { $in: value } : value;
    }

    // Handle comparison operators
    return { [operator]: value };
  }

  private buildSearchConditions(
    rule: SearchRule<any, any>
  ): FilterQuery<TSchema>[] {
    const value = this.query[rule.queryKey];
    if (ValueHelper.isEmpty(value)) return [];

    const searchValue = String(value).trim();
    if (searchValue.length > 100) throw new Error('Search query too long');
    if (!searchValue) return [];

    const regex = RegexHelper.buildSearchRegex(
      searchValue,
      rule.matchMode ?? 'contains',
      rule.options ?? 'i'
    );

    return rule.modelKeys.map(
      (modelKey) =>
        ({
          [modelKey]: regex,
        }) as FilterQuery<TSchema>
    );
  }

  private buildRangeCondition(
    rule: RangeRule<any, any>
  ): FilterQuery<TSchema> | null {
    const startValue = rule.queryKeyStart
      ? this.query[rule.queryKeyStart]
      : undefined;
    const endValue = rule.queryKeyEnd
      ? this.query[rule.queryKeyEnd]
      : undefined;

    const rangeCondition: any = {};

    if (!ValueHelper.isEmpty(startValue)) {
      rangeCondition.$gte = startValue;
    }
    if (!ValueHelper.isEmpty(endValue)) {
      rangeCondition.$lte = endValue;
    }

    if (Object.keys(rangeCondition).length === 0) return null;

    return {
      [rule.modelKey]: rangeCondition,
    } as FilterQuery<TSchema>;
  }

  private buildExistsCondition(
    rule: ExistsRule<any, any>
  ): FilterQuery<TSchema> | null {
    const value = this.query[rule.queryKey];
    if (ValueHelper.isEmpty(value)) return null;

    const shouldExist = ValueHelper.parseBoolean(value);
    if (shouldExist === null) return null;

    const checkExists = rule.checkExists ?? true;
    const exists = checkExists ? shouldExist : !shouldExist;

    return {
      [rule.modelKey]: {
        $exists: exists,
        ...(exists ? { $ne: null } : {}),
      },
    } as FilterQuery<TSchema>;
  }

  private buildArrayCondition(
    rule: ArrayRule<any, any>
  ): FilterQuery<TSchema> | null {
    const value = this.query[rule.queryKey];
    if (ValueHelper.isEmpty(value)) return null;

    const operator = rule.operator ?? '$in';

    switch (operator) {
      case '$all':
        return {
          [rule.modelKey]: {
            $all: Array.isArray(value) ? value : [value],
          },
        } as FilterQuery<TSchema>;

      case '$elemMatch':
        return {
          [rule.modelKey]: {
            $elemMatch: rule.condition ?? { $eq: value },
          },
        } as FilterQuery<TSchema>;

      case '$size':
        const size = parseInt(String(value), 10);
        if (isNaN(size)) return null;
        return {
          [rule.modelKey]: { $size: size },
        } as FilterQuery<TSchema>;

      case '$in':
      default:
        return {
          [rule.modelKey]: Array.isArray(value) ? { $in: value } : value,
        } as FilterQuery<TSchema>;
    }
  }

  // ==========================================================================
  // Merge Logic
  // ==========================================================================

  private mergeConditions(): FilterQuery<TSchema> {
    const filter: FilterQuery<TSchema> = {};

    if (this.$and.length) {
      filter.$and = this.$and;
    }

    if (this.$or.length) {
      if (filter.$and) {
        filter.$and.push({ $or: this.$or });
      } else {
        filter.$or = this.$or;
      }
    }

    return filter;
  }
}

// ============================================================================
// Helper Classes
// ============================================================================

class ValueHelper {
  static isEmpty(value: any): boolean {
    return value === undefined || value === null || value === '';
  }

  static parseBoolean(value: any): boolean | null {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }

    if (typeof value === 'number') return value !== 0;

    return null;
  }
}

class RegexHelper {
  static buildSearchRegex(
    searchValue: string,
    matchMode: 'contains' | 'startsWith' | 'endsWith' | 'exact',
    options: string
  ): RegExp {
    const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = this.buildPattern(escaped, matchMode);
    return new RegExp(pattern, options);
  }

  private static buildPattern(
    escaped: string,
    matchMode: 'contains' | 'startsWith' | 'endsWith' | 'exact'
  ): string {
    switch (matchMode) {
      case 'startsWith':
        return `^${escaped}`;
      case 'endsWith':
        return `${escaped}$`;
      case 'exact':
        return `^${escaped}$`;
      case 'contains':
      default:
        return escaped;
    }
  }
}

export function mapSlugToId<T>(Model: Model<T>) {
  return async (slug: string | string[]) => {
    if (!slug) return null;

    const query = typeof slug === 'string' ? { slug } : { slug: { $in: slug } };

    const docs = await Model.find(query).select('_id').lean();

    // Return a single _id if input was string, array of _ids if array
    if (typeof slug === 'string')
      return (String(docs[0]?._id || '') || undefined) ?? null;
    return docs.map((d) => String(d._id));
  };
}
