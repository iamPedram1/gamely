import paginate, { paginateAggregate } from 'core/utilities/pagination';
import { NotFoundError } from 'core/utilities/errors';

// Types
import type { BaseTFunction } from 'core/services/base/base.service';
import type {
  Model,
  Query,
  HydratedDocument,
  FilterQuery,
  PipelineStage,
} from 'mongoose';
import {
  AggregateReturn,
  BaseQueryOptions,
  FindResult,
  NestedKeyOf,
  NestedValueOf,
  NullableQueryResult,
  RelatedLookup,
} from 'core/types/base.service.type';

/**
 * Generic base service for query operations (read-only) on Mongoose models.
 * Provides reusable methods for finding, checking, and listing documents.
 *
 * @template TSchema - Mongoose schema type.
 * @template TDoc - Hydrated document type (defaults to HydratedDocument<TSchema>).
 */
class BaseQueryService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> {
  constructor(
    protected readonly model: Model<TSchema>,
    protected readonly t: BaseTFunction
  ) {}

  async countDocuments(filter: FilterQuery<TSchema>): Promise<number> {
    return await this.model.countDocuments(filter).lean();
  }

  // <----------------   EXISTANCE   ---------------->

  /**
   * Checks if a document exists matching a filter.
   * @param filter - MongoDB query filter.
   * @returns True if a document exists, false otherwise.
   */
  protected async exists(filter: FilterQuery<TSchema>): Promise<boolean> {
    const res = await this.model.exists(filter).exec();
    return !!res;
  }

  async isMadeBySelf(documentId: string, userId: string) {
    return this.exists({ _id: documentId, creator: userId });
  }

  async existsById(id: string): Promise<boolean> {
    return this.exists({ _id: id } as FilterQuery<TSchema>);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.exists({ slug } as FilterQuery<TSchema>);
  }

  async existsByKey<K extends NestedKeyOf<TSchema>>(
    key: K,
    match: NestedValueOf<TSchema, K>
  ): Promise<boolean> {
    return this.exists({ [key]: match } as FilterQuery<TSchema>);
  }

  // <----------------   SINGLE DOCUMENT   ---------------->

  async getOneById<
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    id: string,
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TDoc, TLean, TThrowError>> {
    const query = this.model.findById(id);
    const result = await this.applyQueryOptions(query, options).exec();

    if (!result && (options?.throwError ?? true)) {
      throw new NotFoundError(this.t('error.not_found_by_id', { id }));
    }

    return result as NullableQueryResult<TDoc, TLean, TThrowError>;
  }

  async getOneBySlug<
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    slug: string,
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TDoc, TLean, TThrowError>> {
    const query = this.model.findOne({ slug } as FilterQuery<TSchema>);
    const result = await this.applyQueryOptions(query, options).exec();

    if (!result && (options?.throwError ?? true)) {
      throw new NotFoundError(
        this.t('error.not_found_by_key', { key: 'slug' })
      );
    }

    return result as NullableQueryResult<TDoc, TLean, TThrowError>;
  }

  async getOneByKey<
    K extends NestedKeyOf<TSchema>,
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    key: K,
    value: NestedValueOf<TSchema, K>,
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TDoc, TLean, TThrowError>> {
    const query = this.model.findOne({ [key]: value } as FilterQuery<TSchema>);
    const result = await this.applyQueryOptions(query, options).exec();

    if (!result && (options?.throwError ?? true)) {
      throw new NotFoundError(
        this.t('error.not_found_by_key_value', {
          key: String(key),
          value: String(value),
        })
      );
    }

    return result as NullableQueryResult<TDoc, TLean, TThrowError>;
  }

  // <----------------   MULTIPLE DOCUMENTS   ---------------->

  async find<TLean extends boolean = false, TPaginate extends boolean = true>(
    options?: BaseQueryOptions<TSchema> & {
      lean?: TLean;
      paginate?: TPaginate;
    }
  ): Promise<FindResult<TDoc, TLean, TPaginate>> {
    const query = this.model.find(options?.filter || {});
    const enrichedQuery = this.applyQueryOptions(query, options);

    if (options?.paginate ?? true) {
      return paginate<TDoc, TDoc>(enrichedQuery, options?.query) as any;
    }

    return enrichedQuery.exec();
  }

  async aggregate<
    TResult = TSchema,
    TPaginate extends boolean | undefined = true,
  >(
    pipeline: PipelineStage[],
    options?: BaseQueryOptions<TSchema> & { paginate?: TPaginate }
  ): Promise<AggregateReturn<TResult, TPaginate>> {
    const aggPipeline = [...pipeline];

    // --- Sorting, limiting, skipping ---
    if (options?.sort) aggPipeline.push({ $sort: options.sort });
    if (options?.skip) aggPipeline.push({ $skip: options.skip });
    if (options?.limit) aggPipeline.push({ $limit: options.limit });

    const paginate = options?.paginate ?? true;

    if (paginate) {
      const result = await paginateAggregate<TResult>(
        this.model,
        aggPipeline,
        options?.query
      );

      return result as AggregateReturn<TResult, TPaginate>;
    }

    const docs = await this.model.aggregate<TResult>(aggPipeline).exec();
    return docs as AggregateReturn<TResult, TPaginate>;
  }

  async findWithRelatedCounts<
    TResult = TSchema,
    TPaginate extends boolean | undefined = true,
  >(
    lookups: RelatedLookup<TSchema>[],
    options?: BaseQueryOptions<TSchema> & { paginate?: TPaginate }
  ): Promise<AggregateReturn<TResult, TPaginate>> {
    const pipeline: PipelineStage[] = [];

    for (const lookup of lookups) {
      pipeline.push({
        $lookup: {
          from: lookup.from,
          localField: String(lookup.localField),
          foreignField: lookup.foreignField,
          as: `${lookup.asField}_docs`,
          ...(lookup.matchStage
            ? { pipeline: [{ $match: lookup.matchStage }] }
            : {}),
        },
      });

      pipeline.push({
        $addFields: {
          [lookup.asField]: { $size: `$${lookup.asField}_docs` },
        },
      });

      pipeline.push({
        $project: { [`${lookup.asField}_docs`]: 0 },
      });
    }

    return this.aggregate<TResult, TPaginate>(pipeline, options);
  }

  // <----------------   PRIVATE METHODS   ---------------->

  /**
   * Applies common query modifiers (select, populate, sort, limit, skip, lean).
   * @param query - Mongoose query instance.
   * @param options - Query customization options.
   * @returns The modified query.
   */
  protected applyQueryOptions<TResult = any>(
    query: Query<TResult, any>,
    options?: BaseQueryOptions<TSchema>
  ): Query<any, any> {
    if (!options) return query as any;

    let q: any = query;

    if (options.select) q = q.select(options.select);
    if (options.populate) q = q.populate(options.populate);
    if (options.sort) q = q.sort(options.sort);
    if (options.limit) q = q.limit(options.limit);
    if (options.skip) q = q.skip(options.skip);
    if (options.lean) q = q.lean();

    return q;
  }
}

export default BaseQueryService;
