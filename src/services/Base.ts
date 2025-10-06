// Utilities
import paginate from 'utilites/pagination';

// Types
import {
  Model,
  Query,
  HydratedDocument,
  FlattenMaps,
  FilterQuery,
  DeleteResult,
} from 'mongoose';

import type IRequestQueryBase from 'types/query';
import type { WithPagination } from 'types/paginate';

// Utility type for populate options
export type PopulateOption = string | string[] | Record<string, unknown>;

export interface IBaseService<TLean, TDoc = unknown> {
  getAll(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select?: string
  ): Promise<WithPagination<TLean>>;

  getAllSummaries(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select?: string
  ): Promise<WithPagination<TLean>>;
  getLeanById(
    id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TLean | null>;
  getDocumentById(
    id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TDoc | null>;
  getBySlug(
    slug: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TLean | null>;

  checkExistenceById(id: string): Promise<boolean>;
  checkExistenceBySlug(slug: string): Promise<boolean>;
  deleteById(id: string): Promise<DeleteResult>;
}

export default abstract class BaseService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
  TLean = FlattenMaps<TDoc>,
> implements IBaseService<TLean, TDoc>
{
  protected model: Model<TSchema>;

  constructor(model: Model<TSchema>) {
    this.model = model;
  }

  // ---------- Helpers ----------
  protected applyPopulate<T extends Query<any, any>>(
    q: T,
    populate?: PopulateOption
  ): T {
    if (!populate) return q;
    return (q as any).populate(populate);
  }

  protected applySelect<T extends Query<any, any>>(q: T, select?: string): T {
    if (!select) return q;
    return (q as any).select(select);
  }

  protected async exists(filter: FilterQuery<TSchema>): Promise<boolean> {
    const res = await (this.model as any).exists(filter).exec();
    return !!res;
  }

  // ---------- Basic checks ----------
  async checkExistenceBySlug(slug: string): Promise<boolean> {
    return this.exists({ slug } as FilterQuery<TSchema>);
  }

  async checkExistenceById(_id: string): Promise<boolean> {
    return this.exists({ _id } as FilterQuery<TSchema>);
  }

  // ---------- Get by slug (lean) ----------
  async getBySlug(
    slug: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TLean | null> {
    let q: Query<TDoc | null, TDoc> = (this.model as any).findOne({
      slug,
    } as FilterQuery<TSchema>);
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    // use lean for performance / plain object
    return (await (q as any).lean().exec()) as unknown as TLean | null;
  }

  // ---------- List / pagination ----------
  async getAll(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select?: string
  ): Promise<WithPagination<TLean>> {
    let q: Query<TDoc[], TDoc> = (this.model as any).find();
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);

    const result = await paginate<TDoc, TDoc>(q as any, reqQuery);
    return result as unknown as WithPagination<TLean>;
  }

  async getAllSummaries(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select = '_id title slug'
  ): Promise<WithPagination<TLean>> {
    let q: Query<TDoc[], TDoc> = (this.model as any).find();
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);

    const result = await paginate<TDoc, TDoc>(q as any, reqQuery);
    return result as unknown as WithPagination<TLean>;
  }

  // ---------- Get by id (lean) ----------
  async getLeanById(
    _id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TLean | null> {
    let q: Query<TDoc | null, TDoc> = (this.model as any).findById(_id);
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return (await (q as any).lean().exec()) as unknown as TLean | null;
  }

  // ---------- Get by id (hydrated document) ----------
  async getDocumentById(
    _id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TDoc | null> {
    let q: Query<TDoc | null, TDoc> = (this.model as any).findById(_id);
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return (await q.exec()) as TDoc | null;
  }

  // ---------- Delete ----------
  async deleteById(_id: string): Promise<DeleteResult> {
    return (this.model as any)
      .deleteOne({ _id } as FilterQuery<TSchema>)
      .exec();
  }
}
