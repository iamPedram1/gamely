import type {
  HydratedDocument,
  FlattenMaps,
  FilterQuery,
  mongo,
} from 'mongoose';

// Services
import BaseQueryService from 'services/base.query.module';
import BaseMutateService from 'services/base.mutate.module';

// Types
import type IRequestQueryBase from 'types/query';
import type { WithPagination } from 'types/paginate';
import BaseService from 'services/base.service.module';

/** Mongoose populate option */
export type PopulateOption =
  | string
  | string[]
  | Record<string, unknown>
  | Record<string, unknown>[];
export type GetOneResult<TLean, TDoc> =
  | (TLean extends true ? FlattenMaps<TDoc> : TDoc)
  | null;

/** Utility type for conditional find return */
export type FindResult<
  TDoc,
  TLean extends boolean,
  TPaginate extends boolean,
> = TPaginate extends false
  ? TLean extends true
    ? FlattenMaps<TDoc>[]
    : TDoc[]
  : WithPagination<TLean extends true ? FlattenMaps<TDoc> : TDoc>;

/** Query options for BaseQueryService */
export interface BaseQueryOptions<TSchema, TLean extends boolean = boolean> {
  /** Request query for pagination */
  reqQuery?: Partial<IRequestQueryBase>;
  /** Filter object for queries */
  filter?: FilterQuery<TSchema>;
  /** Fields to populate */
  populate?: PopulateOption;
  /** Fields to select */
  select?: string;
  /** Sort object */
  sort?: Record<string, 1 | -1>;
  /** Limit number of documents */
  limit?: number;
  /** Skip number of documents */
  skip?: number;
  /** Return plain JS object instead of Mongoose document */
  lean?: TLean;
  /** Enable/disable pagination */
  paginate?: boolean;
}

/** Options for mutation operations */
export interface BaseMutateOptions {
  /** Mongoose client session for transactions */
  session?: mongo.ClientSession;
  /** Return plain JS object instead of Mongoose document */
  lean?: boolean;
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
