import type {
  mongo,
  HydratedDocument,
  FilterQuery,
  FlattenMaps,
  PopulateOptions,
  ClientSession,
} from 'mongoose';

// Services
import BaseService from 'core/services/base/base.service';
import BaseQueryService from 'core/services/base/base.query.service';
import BaseMutateService from 'core/services/base/base.mutate.service';
import BaseValidationService from 'core/services/base/base.validation.service';

// Types
import type { IRequestQueryBase } from 'core/types/query';
import type { WithPagination } from 'core/types/paginate';

/** Options for Mongoose session (transactions) */
export interface BaseSessionOptions {
  /** Optional Mongoose client session */
  session?: ClientSession;
}

/** Options for Mongoose populate */
export interface BasePopulateOptions {
  /** Populate field(s) */
  populate?: PopulateOptions | PopulateOptions[] | string;
}

/** Generic query result type */
export type QueryResult<
  TSchema,
  TDoc,
  TLean extends boolean,
> = TLean extends true ? FlattenMaps<TSchema> : TDoc;

/** Nullable query result type with optional throw behavior */
export type NullableQueryResult<
  TSchema,
  TDoc,
  TLean extends boolean,
  TThrowError extends boolean,
> = TThrowError extends true
  ? QueryResult<TSchema, TDoc, TLean>
  : QueryResult<TSchema, TDoc, TLean> | null;

/** Return type of aggregation queries */
export type AggregateReturn<
  TResult,
  TPaginate extends boolean | undefined,
> = TPaginate extends true ? WithPagination<TResult> : TResult[];

/** Result of array queries */
export type ArrayQueryResult<
  TSchema,
  TDoc,
  TLean extends boolean,
> = TLean extends true ? FlattenMaps<TSchema>[] : TDoc[];

/** Result of find queries with optional pagination */
export type FindResult<
  TSchema,
  TDoc,
  TLean extends boolean,
  TPaginate extends boolean,
> = TPaginate extends false
  ? ArrayQueryResult<TSchema, TDoc, TLean>
  : WithPagination<QueryResult<TSchema, TDoc, TLean>>;

/** Common options for query/mutation services */
interface BaseCommonOptions<TLean extends boolean = boolean> {
  /** Return plain JS object instead of Mongoose document */
  lean?: TLean;
  /** Fields to populate */
  populate?: PopulateOptions[] | string | string[];
}

/** Query options for BaseQueryService */
export interface BaseQueryOptions<TSchema, TLean extends boolean = boolean>
  extends BaseCommonOptions<TLean> {
  /** Request query parameters for pagination and filtering */
  query?: Partial<IRequestQueryBase>;
  /** Filter object for querying documents */
  filter?: FilterQuery<TSchema>;
  /** Fields to select */
  select?: string;
  /** Sort order object */
  sort?: Record<string, 1 | -1>;
  /** Maximum number of documents to return */
  limit?: number;
  /** Number of documents to skip */
  skip?: number;
  /** Enable or disable pagination */
  paginate?: boolean;
}

/** Options for mutation operations (create/update/delete) */
export interface BaseMutateOptions<TLean extends boolean = boolean>
  extends BaseCommonOptions<TLean> {
  /** Mongoose client session for transactional operations */
  session?: mongo.ClientSession;
}

type BaseDoc<T> = HydratedDocument<T>;

/** BaseQueryService type alias */
export type IBaseQueryService<
  TSchema,
  TDoc extends BaseDoc<TSchema> = BaseDoc<TSchema>,
> = BaseQueryService<TSchema, TDoc>;

/** BaseValidationService type alias */
export type IBaseValidationService<
  TSchema,
  TDoc extends BaseDoc<TSchema> = BaseDoc<TSchema>,
> = BaseValidationService<TSchema, TDoc>;

/** BaseMutateService type alias */
export type IBaseMutateService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends BaseDoc<TSchema> = BaseDoc<TSchema>,
> = BaseMutateService<TSchema, TCreateDto, TUpdateDto, TDoc>;

/** Combined BaseService type alias */
export type IBaseService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends BaseDoc<TSchema> = BaseDoc<TSchema>,
> = BaseService<TSchema, TCreateDto, TUpdateDto, TDoc>;

/** Logical OR/AND filter object */
export type OrAndFilter<T> = {
  /** Array of conditions to combine with $or */
  $or?: FilterQuery<T>[];
  /** Array of conditions to combine with $and */
  $and?: FilterQuery<T>[];
};

/** Primitive types treated as leaf nodes */
type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date;

/** Detect MongoDB special types like ObjectId */
type IsSpecialType<T> = T extends { _bsontype: string } ? true : false;

/** Nested keys of an object, recursively excluding primitives, arrays, and special types */
export type NestedKeyOf<T> =
  IsSpecialType<T> extends true
    ? never
    : T extends Primitive | Array<any>
      ? never
      : T extends object
        ? {
            [K in keyof T & string]: IsSpecialType<T[K]> extends true
              ? K
              : T[K] extends Primitive
                ? K
                : T[K] extends Array<any>
                  ? K
                  : T[K] extends object
                    ? K | `${K}.${NestedKeyOf<T[K]>}`
                    : K;
          }[keyof T & string]
        : never;

/** Value type at a nested path */
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

/** Build query configuration object */
export interface BuildQuery<TQuery, TSchema> {
  /** Filters with configurable logic operators */
  filterBy?: FilterRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Search rules with regex */
  searchBy?: SearchRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Range-based filtering */
  rangeBy?: RangeRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Check existence of fields */
  existsBy?: ExistsRule<keyof TQuery, NestedKeyOf<TSchema>>[];
  /** Filter on array elements */
  arrayBy?: ArrayRule<keyof TQuery, NestedKeyOf<TSchema>>[];
}

/** Filter rule configuration */
export interface FilterRule<TQueryKey, TModelKey> {
  /** Query parameter key */
  queryKey: TQueryKey;
  /** Corresponding model key */
  modelKey: TModelKey;
  /** Comparison operator */
  operator?: '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin';
  /** Logic operator for multiple filters */
  logic?: 'and' | 'or';
  /** Optional transform function for query value */
  transform?: (value: any) => any;
}

/** Search rule configuration */
export interface SearchRule<TQueryKey, TModelKey> {
  /** Query parameter key */
  queryKey: TQueryKey;
  /** Corresponding model keys to search */
  modelKeys: TModelKey[];
  /** Logic operator for multiple fields */
  operator?: 'and' | 'or';
  /** Regex options (case-insensitive, multiline, etc.) */
  options?: 'i' | 'im' | 'ims';
  /** Mode of string matching */
  matchMode?: 'contains' | 'startsWith' | 'endsWith' | 'exact';
  /** Optional transform function for query value */
  transform?: (value: any) => any;
}

/** Range filter rule configuration */
export interface RangeRule<TQueryKey, TModelKey> {
  /** Query key for start value */
  queryKeyStart?: TQueryKey;
  /** Query key for end value */
  queryKeyEnd?: TQueryKey;
  /** Corresponding model key */
  modelKey: TModelKey;
}

/** Exists filter rule configuration */
export interface ExistsRule<TQueryKey, TModelKey> {
  /** Query parameter key */
  queryKey: TQueryKey;
  /** Model key to check existence */
  modelKey: TModelKey;
  /** Check if field exists */
  checkExists?: boolean;
}

/** Array filter rule configuration */
export interface ArrayRule<TQueryKey, TModelKey> {
  /** Query parameter key */
  queryKey: TQueryKey;
  /** Model key containing array */
  modelKey: TModelKey;
  /** Operator for array query */
  operator?: '$all' | '$elemMatch' | '$size' | '$in';
  /** Condition object for element matching */
  condition?: Record<string, any>;
}

/** Configuration for related collection lookup */
export interface RelatedLookup<TSchema> {
  /** Name of the related collection */
  from: string;
  /** Local field in current model */
  localField: keyof TSchema;
  /** Field in related collection */
  foreignField: string;
  /** Field name to store count in result */
  asField: string;
  /** Optional additional $match stage for filtering related documents */
  matchStage?: Record<string, unknown>;
}
