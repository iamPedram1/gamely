import type {
  mongo,
  HydratedDocument,
  FilterQuery,
  FlattenMaps,
  PopulateOptions,
  ClientSession,
} from 'mongoose';

// Services
import BaseQueryService from 'services/base.query.module';
import BaseMutateService from 'services/base.mutate.module';

// Types
import BaseService from 'services/base.service.module';
import type { IRequestQueryBase } from 'types/query';
import type { WithPagination } from 'types/paginate';

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
  reqQuery?: Partial<IRequestQueryBase>;
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
