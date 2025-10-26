import type {
  mongo,
  HydratedDocument,
  FilterQuery,
  FlattenMaps,
  PopulateOptions,
  ClientSession,
} from 'mongoose';

// Services
import BaseQueryService from 'core/services/base/base.query.service';
import BaseMutateService from 'core/services/base/base.mutate.service';

// Types
import BaseService from 'core/services/base/base.service';
import type { IRequestQueryBase } from 'core/types/query';
import type { WithPagination } from 'core/types/paginate';
import BaseValidationService from 'core/services/base/base.validation.service';

/** Mongoose populate option */
export interface BaseSessionOptions {
  session?: ClientSession;
}

export interface BasePopulateOptions {
  populate?: PopulateOptions | PopulateOptions[] | string;
}

export type GetOneResult<TLean, TDoc> =
  | (TLean extends true ? FlattenMaps<TDoc> : TDoc)
  | null;

export type QueryResult<TDoc, TLean extends boolean> = TLean extends true
  ? FlattenMaps<TDoc>
  : TDoc;

export type NullableQueryResult<
  TDoc,
  TLean extends boolean,
  TThrowError extends boolean,
> = TThrowError extends true
  ? QueryResult<TDoc, TLean>
  : QueryResult<TDoc, TLean> | null;

export type AggregateReturn<
  TResult,
  TPaginate extends boolean | undefined,
> = TPaginate extends true ? WithPagination<TResult> : TResult[];

export type ArrayQueryResult<TDoc, TLean extends boolean> = TLean extends true
  ? FlattenMaps<TDoc>[]
  : TDoc[];

export type FindResult<
  TDoc,
  TLean extends boolean,
  TPaginate extends boolean,
> = TPaginate extends false
  ? ArrayQueryResult<TDoc, TLean>
  : WithPagination<QueryResult<TDoc, TLean>>;

interface BaseCommonOptions<TLean extends boolean = boolean> {
  /** Return plain JS object instead of Mongoose document */
  lean?: TLean;
  /** Fields to populate */
  populate?: PopulateOptions[] | string | string[];
}

/** Query options for BaseQueryService */
export interface BaseQueryOptions<TSchema, TLean extends boolean = boolean>
  extends BaseCommonOptions<TLean> {
  /** Request query for pagination */
  query?: Partial<IRequestQueryBase>;
  /** Filter object for queries */
  filter?: FilterQuery<TSchema>;
  /** Fields to select */
  select?: string;
  /** Sort object */
  sort?: Record<string, 1 | -1>;
  /** Limit number of documents */
  limit?: number;
  /** Skip number of documents */
  skip?: number;
  /** Enable/disable pagination */
  paginate?: boolean;
}

/** Options for mutation operations */
export interface BaseMutateOptions<TLean extends boolean = boolean>
  extends BaseCommonOptions<TLean> {
  /** Mongoose client session for transactions */
  session?: mongo.ClientSession;
}

export type IBaseQueryService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = BaseQueryService<TSchema, TDoc>;

export type IBaseValidationService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = BaseValidationService<TSchema, TDoc>;

export type IBaseMutateService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = BaseMutateService<TSchema, TCreateDto, TUpdateDto, TDoc>;

// Combined type of BaseService instance
export type IBaseService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = BaseService<TSchema, TCreateDto, TUpdateDto, TDoc>;

export type OrAndFilter<T> = {
  $or?: FilterQuery<T>[];
  $and?: FilterQuery<T>[];
};

// Helper type to check if a type is a primitive or should be treated as a leaf
type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date;

// Helper to detect ObjectId and other special MongoDB types
type IsSpecialType<T> = T extends { _bsontype: string } ? true : false;

// Helper type to get nested paths, excluding array/object methods and special types
export type NestedKeyOf<T> =
  IsSpecialType<T> extends true
    ? never
    : T extends Primitive | Array<any>
      ? never
      : T extends object
        ? {
            [K in keyof T & string]: IsSpecialType<T[K]> extends true
              ? K // Stop at ObjectId, treat as leaf
              : T[K] extends Primitive
                ? K
                : T[K] extends Array<any>
                  ? K // Stop at array level
                  : T[K] extends object
                    ? K | `${K}.${NestedKeyOf<T[K]>}`
                    : K;
          }[keyof T & string]
        : never;

// Helper type to get the value type at a nested path
export type NestedValueOf<
  T,
  P extends string,
> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? NestedValueOf<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export interface BuildQuery<TQuery, TSchema> {
  /** Apply filters with configurable logic operator */
  filterBy?: FilterRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Apply regex search filters */
  searchBy?: SearchRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Apply range filters */
  rangeBy?: RangeRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Apply existence checks */
  existsBy?: ExistsRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Apply array element matching */
  arrayBy?: ArrayRule<keyof TQuery, NestedKeyOf<TSchema>>[];
}

export interface FilterRule<TQueryKey, TModelKey> {
  queryKey: TQueryKey;
  modelKey: TModelKey;
  operator?: '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin';
  logic?: 'and' | 'or'; // 👈 New: determines AND vs OR behavior
  transform?: (value: any) => any;
}

export interface SearchRule<TQueryKey, TModelKey> {
  queryKey: TQueryKey;
  modelKeys: TModelKey[];
  operator?: 'and' | 'or'; // How to combine multiple modelKeys
  options?: 'i' | 'im' | 'ims';
  matchMode?: 'contains' | 'startsWith' | 'endsWith' | 'exact';
}

export interface RangeRule<TQueryKey, TModelKey> {
  queryKeyStart?: TQueryKey;
  queryKeyEnd?: TQueryKey;
  modelKey: TModelKey;
}

export interface ExistsRule<TQueryKey, TModelKey> {
  queryKey: TQueryKey;
  modelKey: TModelKey;
  checkExists?: boolean;
}

export interface ArrayRule<TQueryKey, TModelKey> {
  queryKey: TQueryKey;
  modelKey: TModelKey;
  operator?: '$all' | '$elemMatch' | '$size' | '$in';
  condition?: Record<string, any>;
}

export interface RelatedLookup<TSchema> {
  /**
   * The collection name of the related documents (e.g., 'posts', 'comments')
   */
  from: string;

  /**
   * Field in the current model to match with the related collection.
   * Can be a key of TSchema or a string (for nested paths)
   */
  localField: keyof TSchema;

  /**
   * Field in the related collection to match with localField
   */
  foreignField: string;

  /**
   * The name of the count field to add in the result (e.g., 'postsCount')
   */
  asField: string;

  /**
   * Optional additional $match stage inside the lookup to filter related documents
   */
  matchStage?: Record<string, unknown>;
}
