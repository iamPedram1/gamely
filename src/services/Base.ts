// Utilities
import paginate from 'utilites/pagination';

// Types
import type {
  Model,
  HydratedDocument,
  FlattenMaps,
  DeleteResult,
  FilterQuery,
  Query,
} from 'mongoose';
import type IRequestQueryBase from 'types/query';
import type { WithPagination } from 'types/paginate';

export interface IBaseService<TLean> {
  getAll(reqQuery?: IRequestQueryBase): Promise<WithPagination<TLean>>;
  getAllSummaries(reqQuery?: IRequestQueryBase): Promise<WithPagination<TLean>>;
  getById(id: string): Promise<TLean | null>;
  getBySlug(slug: string): Promise<TLean | null>;
  checkExistenceById(id: string): Promise<boolean>;
  checkExistenceBySlug(slug: string): Promise<boolean>;
  deleteById(id: string): Promise<DeleteResult>;
}

export default abstract class BaseService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
  TLean = FlattenMaps<TDoc>,
> implements IBaseService<TLean>
{
  protected model: Model<TSchema>;

  constructor(model: Model<TSchema>) {
    this.model = model;
  }

  protected async exists(filter: FilterQuery<TSchema>): Promise<boolean> {
    const res = await (this.model as any).exists(filter).exec();
    return !!res;
  }

  async checkExistenceBySlug(slug: string): Promise<boolean> {
    return this.exists({ slug } as FilterQuery<TSchema>);
  }

  async checkExistenceById(_id: string): Promise<boolean> {
    return this.exists({ _id } as FilterQuery<TSchema>);
  }

  async getBySlug(
    slug: string,
    populate?: string | Array<string> | Record<string, unknown>
  ): Promise<TLean | null> {
    let q: Query<TDoc | null, TDoc> = (this.model as any).findOne({
      slug,
    } as FilterQuery<TSchema>);
    if (populate) q = (q as any).populate(populate);

    return (await (q as any).lean().exec()) as unknown as TLean | null;
  }

  async getAll(
    reqQuery?: IRequestQueryBase,
    populate?: string | Array<string> | Record<string, unknown>
  ): Promise<WithPagination<TLean>> {
    let q: Query<TDoc[], TDoc> = (this.model as any).find();
    if (populate) q = (q as any).populate(populate);

    const result = await paginate<TDoc, TDoc>(q as any, reqQuery);
    return result as unknown as WithPagination<TLean>;
  }

  async getAllSummaries(
    reqQuery?: IRequestQueryBase,
    select = '_id title slug'
  ): Promise<WithPagination<TLean>> {
    let q: Query<TDoc[], TDoc> = (this.model as any).find().select(select);
    const result = await paginate<TDoc, TDoc>(q as any, reqQuery);
    return result as unknown as WithPagination<TLean>;
  }

  async getById(
    _id: string,
    populate?: string | Array<string> | Record<string, unknown>
  ): Promise<TLean | null> {
    let q: Query<TDoc | null, TDoc> = this.model.findById(_id);
    if (populate) q = (q as any).populate(populate);
    return (await (q as any).lean().exec()) as unknown as TLean | null;
  }

  async deleteById(_id: string): Promise<DeleteResult> {
    return this.model.deleteOne({ _id } as FilterQuery<TSchema>).exec();
  }
}
