import type {
  Model,
  Query,
  HydratedDocument,
  FlattenMaps,
  FilterQuery,
  UpdateResult,
  DeleteResult,
  AnyKeys,
  UpdateWithAggregationPipeline,
  UpdateQuery,
} from 'mongoose';

// Utilities
import paginate from 'utilites/pagination';
import { ValidationError } from 'utilites/errors';

// Types
import type IRequestQueryBase from 'types/query';
import type { WithPagination } from 'types/paginate';
import type { IApiBatchResponse, IApiBatchResult } from 'utilites/response';

/**
 * Utility type for populate options in mongoose queries.
 */
export type PopulateOption = string | string[] | Record<string, unknown>;

/**
 * Base service interface defining standard CRUD and utility methods for Mongoose models.
 *
 * @template TSchema - The Mongoose schema type.
 * @template TCreateDto - The DTO type used for creating a document.
 * @template TUpdateDto - The DTO type used for updating a document.
 * @template TDoc - The Mongoose document type (hydrated).
 */
export interface IBaseService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> {
  /**
   * Retrieve all documents with optional pagination, population, and field selection.
   *
   * @param reqQuery - Query parameters for filtering and pagination.
   * @param populate - Optional populate configuration.
   * @param select - Optional field selection.
   * @returns Paginated list of lean documents.
   */
  getAll(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select?: string
  ): Promise<WithPagination<FlattenMaps<TDoc>>>;

  /**
   * Retrieve summarized documents with optional pagination, population, and field selection.
   *
   * @param reqQuery - Query parameters for filtering and pagination.
   * @param populate - Optional populate configuration.
   * @param select - Optional field selection.
   * @returns Paginated list of summarized lean documents.
   */
  getAllSummaries(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select?: string
  ): Promise<WithPagination<FlattenMaps<TDoc>>>;

  /**
   * Retrieve a lean document by its ID.
   *
   * @param id - The document ID.
   * @param populate - Optional populate configuration.
   * @param select - Optional field selection.
   * @returns The lean document or `null` if not found.
   */
  getLeanById(
    id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<FlattenMaps<TDoc> | null>;

  /**
   * Retrieve a full Mongoose document by its ID.
   *
   * @param id - The document ID.
   * @param populate - Optional populate configuration.
   * @param select - Optional field selection.
   * @returns The hydrated Mongoose document or `null` if not found.
   */
  getDocumentById(
    id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TDoc | null>;

  /**
   * Retrieve a lean document by its slug field.
   *
   * @param slug - The slug value to search by.
   * @param populate - Optional populate configuration.
   * @param select - Optional field selection.
   * @returns The lean document or `null` if not found.
   */
  getBySlug(
    slug: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<FlattenMaps<TDoc> | null>;

  /**
   * Check whether a document exists by its ID.
   *
   * @param id - The document ID.
   * @returns `true` if a document exists, otherwise `false`.
   */
  existsById(id: string): Promise<boolean>;

  /**
   * Check whether a document exists by its slug field.
   *
   * @param slug - The slug value to search by.
   * @returns `true` if a document exists, otherwise `false`.
   */
  existsBySlug(slug: string): Promise<boolean>;

  /**
   * Delete a single document by ID.
   *
   * @param id - The document ID to delete.
   * @returns The deletion result.
   */
  deleteOneById(id: string): Promise<DeleteResult>;

  /**
   * Delete multiple documents by their IDs.
   *
   * @param ids - Array of document IDs to delete.
   * @returns Batch operation result with success and failure counts.
   */
  batchDelete(ids: string[]): Promise<IApiBatchResponse>;

  /**
   * Delete all documents where a specific field matches the given value.
   *
   * @param keyName - The field name to match.
   * @param value - The value to match.
   * @returns The deletion result.
   */
  deleteManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    value: any
  ): Promise<DeleteResult>;

  /**
   * Remove a single ID reference from an array field across all documents.
   *
   * @param keyName - The array field name.
   * @param id - The ID to remove.
   * @returns The update result.
   */
  removeIdFromArrayField(
    keyName: keyof TSchema,
    id: string
  ): Promise<UpdateResult>;

  /**
   * Remove multiple ID references from an array field across all documents.
   *
   * @param keyName - The array field name.
   * @param ids - The list of IDs to remove.
   * @returns The update result.
   */
  removeIdsFromArrayField(
    keyName: keyof TSchema,
    ids: string[]
  ): Promise<UpdateResult>;

  /**
   * Create a new document.
   *
   * @param data - The data used to create the document.
   * @param userId - Optional user ID associated with the creation.
   * @returns The created document.
   */
  create(data: Partial<TCreateDto>, userId?: string): Promise<TDoc>;

  /**
   * Update an existing document by its ID.
   *
   * @param id - The document ID.
   * @param payload - The data to update the document with.
   * @returns The updated document.
   */
  update(id: string, payload: Partial<TUpdateDto>): Promise<TDoc>;

  /**
   * Update multiple documents that reference a specific ID through a given key.
   *
   * @template TSchema - The schema type.
   * @param referenceId - The ID used to find related documents.
   * @param referenceKey - The field name that stores the reference.
   * @param value - The value to set for matched documents.
   * @returns A promise that resolves to the update result.
   */
  updateManyByReference<K extends keyof TSchema>(
    referenceId: string,
    referenceKey: K,
    value: TSchema[K]
  ): Promise<UpdateResult>;

  /**
   * Update multiple documents that reference any of the provided IDs through a given key.
   *
   * @template TSchema - The schema type.
   * @param referenceIds - An array of IDs used to find related documents.
   * @param referenceKey - The field name that stores the references.
   * @param value - The value to set for matched documents.
   * @returns A promise that resolves to the update result.
   */
  updateManyByReferences<K extends keyof TSchema>(
    referenceIds: string[],
    referenceKey: K,
    value: TSchema[K]
  ): Promise<UpdateResult>;
}

export default abstract class BaseService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> implements IBaseService<TSchema, TCreateDto, TUpdateDto, TDoc>
{
  protected model: Model<TSchema>;

  constructor(model: Model<TSchema>) {
    this.model = model;
  }

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
    const res = await this.model.exists(filter).exec();
    return !!res;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.exists({ slug } as FilterQuery<TSchema>);
  }

  async existsById(_id: string): Promise<boolean> {
    return this.exists({ _id } as FilterQuery<TSchema>);
  }

  async getBySlug(
    slug: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<FlattenMaps<TDoc> | null> {
    let q: Query<TDoc | null, TDoc> = this.model.findOne({
      slug,
    } as FilterQuery<TSchema>);
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return (await q.lean().exec()) as FlattenMaps<TDoc> | null;
  }

  async getAll(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select?: string
  ): Promise<WithPagination<FlattenMaps<TDoc>>> {
    let q: Query<TDoc[], TDoc> = this.model.find();
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return (await paginate<TDoc, TDoc>(q as any, reqQuery)) as WithPagination<
      FlattenMaps<TDoc>
    >;
  }

  async getAllSummaries(
    reqQuery?: IRequestQueryBase,
    populate?: PopulateOption,
    select = '_id title slug'
  ): Promise<WithPagination<FlattenMaps<TDoc>>> {
    let q: Query<TDoc[], TDoc> = this.model.find();
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return (await paginate<TDoc, TDoc>(q as any, reqQuery)) as WithPagination<
      FlattenMaps<TDoc>
    >;
  }

  async getLeanById(
    _id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<FlattenMaps<TDoc> | null> {
    let q: Query<TDoc | null, TDoc> = this.model.findById(_id);
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return (await q.lean().exec()) as FlattenMaps<TDoc> | null;
  }

  async getDocumentById(
    _id: string,
    populate?: PopulateOption,
    select?: string
  ): Promise<TDoc | null> {
    let q: Query<TDoc | null, TDoc> = this.model.findById(_id);
    q = this.applyPopulate(q, populate);
    q = this.applySelect(q, select);
    return await q.exec();
  }

  async deleteOneById(_id: string): Promise<DeleteResult> {
    return this.model.deleteOne({ _id } as FilterQuery<TSchema>).exec();
  }

  async deleteManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    value: any
  ): Promise<DeleteResult> {
    return (await this.model.deleteMany({
      [keyName]: value,
    } as FilterQuery<TSchema>)) as DeleteResult;
  }

  async batchDelete(ids: string[]): Promise<IApiBatchResponse> {
    const errors: string[] = [];
    const failedIds: string[] = [];
    const successIds: string[] = [];
    const results: IApiBatchResult[] = [];

    const deleteResults = await Promise.allSettled(
      ids.map((id) => this.deleteOneById(id))
    );

    deleteResults.forEach((result, index) => {
      const id = ids[index];
      if (result.status === 'rejected') {
        failedIds.push(id);
        const message = result.reason?.message || 'An error occurred';
        errors.push(message);
        results.push({ id, message, success: false });
      } else {
        if (result.value.deletedCount > 0) {
          successIds.push(id);
          results.push({ id, message: 'Deleted successfully', success: true });
        } else {
          const message = 'Document does not exist';
          errors.push(message);
          failedIds.push(id);
          results.push({ id, message, success: false });
        }
      }
    });

    return {
      results,
      errors,
      failedIds,
      successIds,
      totalCount: ids.length,
      successCount: successIds.length,
      isAllSucceed: successIds.length === ids.length,
    };
  }

  async removeIdFromArrayField(
    keyName: keyof AnyKeys<TSchema>,
    id: string
  ): Promise<UpdateResult> {
    return this.model
      .updateMany(
        { [keyName]: { $in: [id] } } as FilterQuery<TSchema>,
        { $pull: { [keyName]: id } } as
          | UpdateWithAggregationPipeline
          | UpdateQuery<TSchema>
      )
      .exec();
  }

  async removeIdsFromArrayField(
    keyName: keyof TSchema,
    ids: string[]
  ): Promise<UpdateResult> {
    return this.model
      .updateMany(
        { [keyName]: { $in: ids } } as FilterQuery<TSchema>,
        { $pull: { [keyName]: { $in: ids } } } as
          | UpdateWithAggregationPipeline
          | UpdateQuery<TSchema>
      )
      .exec();
  }

  async updateManyByReference<K extends keyof TSchema>(
    id: string,
    referenceKey: K,
    value: TSchema[K]
  ): Promise<UpdateResult> {
    return this.model
      .updateMany(
        { [referenceKey]: id } as FilterQuery<TSchema>,
        { [referenceKey]: value } as
          | UpdateWithAggregationPipeline
          | UpdateQuery<TSchema>
      )
      .exec();
  }

  async updateManyByReferences(
    id: string[],
    keyName: keyof AnyKeys<TSchema>,
    value: any
  ): Promise<UpdateResult> {
    return this.model
      .updateMany(
        { [keyName]: { $in: id } } as FilterQuery<TSchema>,
        { [keyName]: value } as
          | UpdateWithAggregationPipeline
          | UpdateQuery<TSchema>
      )
      .exec();
  }

  async create(data: Partial<TCreateDto>, userId?: string): Promise<TDoc> {
    const doc = (await new this.model({
      ...data,
      creator: userId,
    }).save()) as TDoc;
    if (!doc) throw new ValidationError('Document could not be created');
    return doc;
  }

  async update(
    id: string,
    payload: Partial<TUpdateDto>,
    populate?: PopulateOption,
    select?: string
  ): Promise<TDoc> {
    let q: Query<TDoc | null, TDoc> = this.model.findByIdAndUpdate(
      id,
      payload as unknown as UpdateQuery<TSchema>,
      { new: true }
    );
    q = this.applySelect(q, select);
    q = this.applyPopulate(q, 'creator' + ' ' + populate);

    const doc = await q.exec();
    if (!doc) throw new ValidationError('Document could not be updated');
    return doc;
  }
}
