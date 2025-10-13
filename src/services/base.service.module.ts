import { startSession } from 'mongoose';

// Services
import BaseQueryService from 'services/base.query.module';
import BaseMutateService from 'services/base.mutate.module';

// Utilities
import { IApiBatchResponse } from 'utilites/response';

// Types
import type {
  Model,
  HydratedDocument,
  FlattenMaps,
  DeleteResult,
  UpdateResult,
  ClientSession,
  AnyKeys,
  UpdateWithAggregationPipeline,
  UpdateQuery,
  PipelineStage,
} from 'mongoose';
import type {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
  IBaseMutateService,
  IBaseQueryService,
  IBaseService,
  NullableQueryResult,
} from 'services/base.service.type';

type Q<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = IBaseQueryService<TSchema, TDoc>;

type M<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = IBaseMutateService<TSchema, TCreateDto, TUpdateDto, TDoc>;

/**
 * BaseService
 *
 * A generic service that combines querying and mutation operations
 * for a given Mongoose model. Uses `BaseQueryService` for read operations
 * and `BaseMutateService` for create/update/delete operations.
 *
 * @template TSchema - The Mongoose schema type
 * @template TCreateDto - Type for create DTO
 * @template TUpdateDto - Type for update DTO
 * @template TDoc - The hydrated document type, defaults to `HydratedDocument<TSchema>`
 */
export default abstract class BaseService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> implements IBaseService<TSchema, TCreateDto, TUpdateDto, TDoc>
{
  private queries: Q<TSchema, TDoc>;
  private mutations: M<TSchema, TCreateDto, TUpdateDto, TDoc>;

  constructor(private model: Model<TSchema>) {
    this.queries = new BaseQueryService<TSchema, TDoc>(model);
    this.mutations = new BaseMutateService(model);
  }

  /**
   * Run a callback inside a MongoDB transaction
   *
   * @param fn - Async callback receiving the session
   * @returns Result of the callback
   */
  protected async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await startSession();
    try {
      return await session.withTransaction(() => fn(session));
    } catch (error) {
      throw error;
    } finally {
      session.endSession();
    }
  }

  // =====================
  // EXISTENCE CHECKS
  // =====================

  /**
   * Checks if a document exists by its ID.
   * @param id - Document ID.
   * @returns True if the document exists, false otherwise.
   */
  async existsById(id: string): Promise<boolean> {
    return this.queries.existsById(id);
  }

  /**
   * Checks if a document exists by its slug.
   * @param slug - Slug to match.
   * @returns True if a document exists, false otherwise.
   */
  async existsBySlug(slug: string): Promise<boolean> {
    return this.queries.existsBySlug(slug);
  }

  /**
   * Checks if a document exists by a specific key-value pair.
   * @param key - Field name to match.
   * @param match - Value to compare.
   * @returns True if a document exists, false otherwise.
   */
  async existsByKey<K extends keyof TSchema>(
    key: K,
    match: TSchema[K]
  ): Promise<boolean> {
    return this.queries.existsByKey(key, match);
  }

  // =====================
  // FIND OPERATIONS
  // =====================

  /**
   * Finds multiple documents with optional filters, sorting, pagination, and population.
   * @param options - Query customization options:
   *  - `filter`: MongoDB filter object
   *  - `sort`: sort expression
   *  - `limit`, `skip`: pagination parameters
   *  - `populate`: relations to populate
   *  - `lean`: return plain objects instead of hydrated docs
   *  - `paginate`: whether to paginate results (default: true)
   *  - `reqQuery`: query parameters for the `paginate` utility
   * @returns Either a paginated result or an array of documents.
   */
  async find<TLean extends boolean = false, TPaginate extends boolean = true>(
    options?:
      | (BaseQueryOptions<TSchema, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<TDoc, TLean, TPaginate>> {
    return await this.queries.find(options);
  }

  async aggregate<TPaginate extends boolean = true>(
    pipeline: PipelineStage[],
    options?: BaseQueryOptions<TSchema> & {
      paginate?: TPaginate;
    }
  ) {
    return this.queries.aggregate(pipeline, options);
  }

  /**
   * Retrieves a single document by its ID.
   * @param id - Document ID.
   * @param options - Query customization options:
   *  - `select`: fields to include/exclude
   *  - `populate`: relations to populate
   *  - `lean`: if true, returns a plain JS object instead of a hydrated doc
   *  - `throwError`: if true (default), throws NotFoundError when not found
   * @returns The found document or null (if throwError=false).
   * @throws {NotFoundError} If document not found and throwError is true.
   */
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
    return this.queries.getOneById(id, options);
  }

  /**
   * Retrieves a single document by its slug.
   * @param slug - Slug to look for.
   * @param options - Same as {@link getOneById}.
   * @returns The found document or null.
   * @throws {NotFoundError} If not found and throwError is true.
   */
  async getOneBySlug<
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    slug: string,
    options?: Omit<BaseQueryOptions<TSchema, TLean>, 'filter'> & {
      throwError?: TThrowError;
    }
  ): Promise<
    TThrowError extends true
      ? TLean extends true
        ? FlattenMaps<TDoc>
        : TDoc
      : TLean extends true
        ? FlattenMaps<TDoc> | null
        : TDoc | null
  > {
    return this.queries.getOneBySlug(slug, options);
  }

  /**
   * Retrieves a single document matching a key-value pair.
   * @param key - Field name to match.
   * @param value - Field value.
   * @param options - Same as {@link getOneById}.
   * @returns The found document or null.
   * @throws {NotFoundError} If not found and throwError is true.
   */
  async getOneByKey<
    K extends keyof TSchema,
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    key: K,
    value: TSchema[K],
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TDoc, TLean, TThrowError>> {
    return this.queries.getOneByKey(key, value, options);
  }

  // =====================
  // CREATE OPERATIONS
  // =====================

  /**
   * Creates a new document.
   * @param data - Data to create the document with.
   * @param userId - Optional creator ID to attach.
   * @param options - Mongoose session or populate options.
   * @returns Created document.
   * @throws {InternalServerError} If creation fails.
   */
  async create<TThrowError extends boolean = true>(
    data: TCreateDto,
    userId?: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? TDoc : TDoc | null> {
    return this.mutations.create(data, userId, options);
  }

  // =====================
  // UPDATE OPERATIONS
  // =====================

  /**
   * Updates a document by ID.
   * @param id - Document ID.
   * @param payload - Fields to update.
   * @param options - Options including session or throwError flag.
   * @returns Updated document or null.
   * @throws {NotFoundError} If document is not found and throwError is true.
   */
  async updateOneById<TThrowError extends boolean = true>(
    id: string,
    payload: Partial<TUpdateDto>,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? TDoc : TDoc | null> {
    return this.mutations.updateOneById(id, payload, options);
  }

  /**
   * Updates multiple documents by a matching key.
   * @param keyName - Field name to match.
   * @param matchValue - Value to match against.
   * @param data - Update data or aggregation pipeline.
   * @param options - Mutation options.
   * @returns MongoDB update result.
   * @throws {NotFoundError} If no documents are matched.
   * @throws {InternalServerError} If matched documents cannot be updated.
   */
  async updateManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    matchValue: TSchema[typeof keyName],
    data: UpdateWithAggregationPipeline | UpdateQuery<TSchema>,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.updateManyByKey(keyName, matchValue, data, options);
  }

  /**
   * Updates many documents referencing a specific ID.
   * @param id - Reference ID.
   * @param referenceKey - Key that holds the reference.
   * @param value - New value to assign.
   * @param options - Mutation options.
   * @returns MongoDB update result.
   */
  async updateManyByReference<K extends keyof TSchema>(
    referenceId: string,
    referenceKey: K,
    value: any,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.updateManyByReference(
      referenceId,
      referenceKey,
      value,
      options
    );
  }

  /**
   * Updates many documents with multiple reference IDs.
   * @param ids - List of reference IDs.
   * @param referenceKey - Key that holds the reference.
   * @param value - New value to assign.
   * @param options - Mutation options.
   * @returns MongoDB update result.
   * @throws {NotFoundError} If no matching references found.
   */
  async updateManyByReferences<K extends keyof TSchema>(
    referenceIds: string[],
    referenceKey: K,
    value: TSchema[K],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.updateManyByReferences(
      referenceIds,
      referenceKey,
      value,
      options
    );
  }

  // =====================
  // DELETE OPERATIONS
  // =====================

  /**
   * Deletes a document by ID.
   * @param id - Document ID.
   * @param options - Options including session or throwError flag.
   * @returns True if deleted, otherwise false.
   * @throws {NotFoundError} If document not found and throwError is true.
   */
  async deleteOneById<TThrowError extends boolean = true>(
    id: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    return this.mutations.deleteOneById(id, options);
  }

  /**
   * Deletes multiple documents by key.
   * @param keyName - Field name to match.
   * @param matchValue - Value to match.
   * @param options - Mutation options.
   * @returns MongoDB delete result.
   * @throws {NotFoundError} If no documents found.
   */
  async deleteManyByKey<TThrowError extends boolean = false>(
    keyName: keyof AnyKeys<TSchema>,
    matchValue: any,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<DeleteResult> {
    return this.mutations.deleteManyByKey(keyName, matchValue, options);
  }

  /**
   * Deletes multiple documents in batch by IDs.
   * @param ids - Array of document IDs.
   * @param options - Mutation options.
   * @returns Batch delete result summary.
   * @throws {ValidationError} If `ids` array is empty.
   * @throws {InternalServerError} If deletion fails.
   */
  async batchDelete(
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<IApiBatchResponse> {
    return this.mutations.batchDelete(ids, options);
  }

  // =====================
  // ARRAY FIELD OPERATIONS
  // =====================

  /**
   * Removes an ID from array fields in all matching documents.
   * @param keyName - Array field name.
   * @param id - ID to remove.
   * @param options - Mutation options.
   * @returns MongoDB update result.
   */
  async removeIdFromArrayField(
    keyName: keyof TSchema,
    id: string,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.removeIdFromArrayField(keyName, id, options);
  }

  /**
   * Removes multiple IDs from array fields in all matching documents.
   * @param keyName - Array field name.
   * @param ids - IDs to remove.
   * @param options - Mutation options.
   * @returns MongoDB update result.
   * @throws {NotFoundError} If no documents are matched.
   */
  async removeIdsFromArrayField(
    keyName: keyof TSchema,
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.removeIdsFromArrayField(keyName, ids, options);
  }
}
