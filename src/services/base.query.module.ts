import type {
  Model,
  Query,
  HydratedDocument,
  FlattenMaps,
  FilterQuery,
} from 'mongoose';

// Utilities
import paginate from 'utilites/pagination';

// Types
import type { WithPagination } from 'types/paginate';
import type {
  BaseQueryOptions,
  IBaseQueryService,
} from 'services/base.service.type';

export default class BaseQueryService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> implements IBaseQueryService<TSchema, TDoc>
{
  protected readonly model: Model<TSchema>;

  constructor(model: Model<TSchema>) {
    this.model = model;
  }

  private async exists(filter: FilterQuery<TSchema>): Promise<boolean> {
    const res = await this.model.exists(filter).exec();
    return !!res;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.exists({ slug } as FilterQuery<TSchema>);
  }

  async existsById(id: string): Promise<boolean> {
    return this.exists({ _id: id } as FilterQuery<TSchema>);
  }

  async existsByKey<K extends keyof TSchema>(
    key: K,
    match: TSchema[K] | string
  ): Promise<boolean> {
    return await this.exists({ [key]: match } as FilterQuery<TSchema>);
  }

  async getBySlug<TLean extends boolean = false>(
    slug: string,
    options?: Omit<BaseQueryOptions<TSchema, TLean>, 'filter'>
  ): Promise<FlattenMaps<TDoc> | null> {
    let q: Query<TDoc | null, TDoc> = this.model.findOne({
      slug,
    } as FilterQuery<TSchema>);

    this.applyQueryOptions(q, options);

    return (await q.lean().exec()) as FlattenMaps<TDoc> | null;
  }

  async find<TLean extends boolean = false, TPaginate extends boolean = true>(
    options?: BaseQueryOptions<TSchema, boolean> & {
      lean?: TLean;
      paginate?: TPaginate;
    }
  ): Promise<
    TPaginate extends false
      ? TLean extends true
        ? FlattenMaps<TDoc>[]
        : TDoc[]
      : WithPagination<TLean extends true ? FlattenMaps<TDoc> : TDoc>
  > {
    // Start base query
    let query = this.model.find(options?.filter || {});

    // Apply dynamic query options
    query = this.applyQueryOptions(query, options);

    // Conditionally paginate
    if (options?.paginate ?? true) {
      const result = await paginate<TDoc, TDoc>(
        query as any,
        options?.reqQuery
      );
      return result as any;
    } else {
      const result = await query.exec();
      return result as any;
    }
  }

  async getOneById<TLean extends boolean = false>(
    id: string,
    options?: Omit<BaseQueryOptions<TSchema, TLean>, 'filter'>
  ): Promise<(TLean extends true ? FlattenMaps<TDoc> : TDoc) | null> {
    let q = this.model.findById(id);

    this.applyQueryOptions(q, options);

    const result = options?.lean
      ? await (
          q.lean() as unknown as Query<FlattenMaps<TDoc> | null, TDoc>
        ).exec()
      : await q.exec();

    return result as (TLean extends true ? FlattenMaps<TDoc> : TDoc) | null;
  }

  private applyQueryOptions<
    TSchema,
    TDoc,
    TResult,
    TLean extends boolean = false,
  >(
    query: Query<TResult, TDoc>,
    options?: BaseQueryOptions<TSchema, TLean>
  ): Query<any, TDoc> {
    if (!options) return query as any;

    let q = query;

    if (options.select) q = q.select(options.select) as any;
    if (options.populate) q = q.populate(options.populate as string);
    if (options.sort) q = q.sort(options.sort);
    if (options.limit) q = q.limit(options.limit);
    if (options.skip) q = q.skip(options.skip);
    if (options.lean) q = q.lean() as any;

    return q as Query<
      TLean extends true
        ? TResult extends (infer R)[]
          ? FlattenMaps<R>[]
          : FlattenMaps<TResult>
        : TResult,
      TDoc
    >;
  }
}
