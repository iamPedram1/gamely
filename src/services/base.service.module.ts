import mongoose from 'mongoose';
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
} from 'mongoose';

// Services
import BaseQueryService from 'services/base.query.module';
import BaseMutateService from 'services/base.mutate.module';

// Utilities
import { IApiBatchResponse } from 'utilites/response';

// Types
import {
  BaseMutateOptions,
  BaseQueryOptions,
  FindResult,
  GetOneResult,
  IBaseMutateService,
  IBaseQueryService,
  IBaseService,
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
  /** Internal query service */
  private queries: Q<TSchema, TDoc>;

  /** Internal mutation service */
  private mutations: M<TSchema, TCreateDto, TUpdateDto, TDoc>;

  /**
   * Creates a new BaseService instance
   * @param model - Mongoose model for the service
   */
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
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(() => fn(session));
    } catch (error) {
      throw error;
    } finally {
      session.endSession();
    }
  }
  // =====================
  // QUERY METHODS
  // =====================

  /**
   * Finds documents matching the query options
   * @template TLean - Whether to return lean objects
   * @template TPaginate - Whether to paginate results
   * @param options - Query options including filter, select, sort, paginate, etc.
   * @returns The queried documents, optionally lean and/or paginated
   */
  async find<TLean extends boolean = false, TPaginate extends boolean = true>(
    options?:
      | (BaseQueryOptions<TSchema, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<TDoc, TLean, TPaginate>> {
    return this.queries.find(options);
  }

  /**
   * Retrieves a single document by its slug
   * @template TLean - Whether to return a lean object
   * @param slug - The slug of the document
   * @param options - Query options excluding the filter
   * @returns The document or null if not found
   */
  async getBySlug<TLean extends boolean = false>(
    slug: string,
    options?: Omit<BaseQueryOptions<TSchema, TLean>, 'filter'>
  ): Promise<FlattenMaps<TDoc> | null> {
    return this.queries.getBySlug(slug, options);
  }

  /**
   * Retrieves a single document by its ID
   * @template TLean - Whether to return a lean object
   * @param id - Document ID
   * @param options - Query options excluding the filter
   * @returns The document or null if not found
   */
  async getOneById<TLean extends boolean = false>(
    id: string,
    options?: Omit<BaseQueryOptions<TSchema, TLean>, 'filter'> | undefined
  ): Promise<GetOneResult<TLean, TDoc>> {
    return this.queries.getOneById(id, options);
  }

  /** Checks if a document exists by ID */
  async existsById(id: string): Promise<boolean> {
    return this.queries.existsById(id);
  }

  /** Checks if a document exists by Key */
  async existsByKey<K extends keyof TSchema>(
    key: K,
    match: TSchema[K] | string
  ): Promise<boolean> {
    return this.queries.existsByKey(key, match);
  }

  /** Checks if a document exists by slug */
  async existsBySlug(slug: string): Promise<boolean> {
    return this.queries.existsBySlug(slug);
  }

  // =====================
  // MUTATION METHODS
  // =====================

  /**
   * Creates a new document
   * @param data - Partial create DTO
   * @param userId - Optional creator user ID
   * @param options - Optional mutation options (e.g., session)
   * @returns The created document
   */
  async create(
    data: Partial<TCreateDto>,
    userId?: string,
    options?: BaseMutateOptions
  ): Promise<TDoc> {
    return this.mutations.create(data, userId, options);
  }

  /**
   * Updates a document by ID
   * @param id - Document ID
   * @param payload - Partial update DTO
   * @param options - Optional mutation options
   * @returns The updated document
   */
  async updateOneById(
    id: string,
    payload: Partial<TUpdateDto>,
    options?: BaseMutateOptions
  ): Promise<TDoc> {
    return this.mutations.updateOneById(id, payload, options);
  }

  /**
   * Deletes a single document by ID
   * @param id - Document ID
   * @param options - Optional mutation options
   * @returns The delete result
   */
  async deleteOneById(
    id: string,
    options?: BaseMutateOptions
  ): Promise<DeleteResult> {
    return this.mutations.deleteOneById(id, options);
  }

  /**
   * Deletes multiple documents by IDs
   * @param ids - Array of document IDs
   * @param options - Optional mutation options
   * @returns Batch response including successes and failures
   */
  async batchDelete(
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<IApiBatchResponse> {
    return this.mutations.batchDelete(ids, options);
  }

  async updateManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    matchValue: TSchema[typeof keyName],
    data: UpdateWithAggregationPipeline | UpdateQuery<TSchema>,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.updateManyByKey(keyName, matchValue, data, options);
  }

  /**
   * Deletes documents matching a key/value pair
   * @param keyName - Schema field name
   * @param matchValue - Value to match
   * @param options - Optional mutation options
   * @returns The delete result
   */
  async deleteManyByKey<K extends keyof TSchema>(
    keyName: K,
    matchValue: any,
    options?: BaseMutateOptions
  ): Promise<DeleteResult> {
    return this.mutations.deleteManyByKey(keyName, matchValue, options);
  }

  /**
   * Updates multiple documents referencing a single ID
   * @param referenceId - Reference ID
   * @param referenceKey - Field that stores the reference
   * @param value - New value to set
   * @param options - Optional mutation options
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
   * Updates multiple documents referencing multiple IDs
   * @param referenceIds - Array of reference IDs
   * @param referenceKey - Field that stores the reference
   * @param value - New value to set
   * @param options - Optional mutation options
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

  /**
   * Removes a single ID from an array field
   * @param keyName - Schema field name
   * @param id - ID to remove
   * @param options - Optional mutation options
   */
  async removeIdFromArrayField(
    keyName: keyof TSchema,
    id: string,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.removeIdFromArrayField(keyName, id, options);
  }

  /**
   * Removes multiple IDs from an array field
   * @param keyName - Schema field name
   * @param ids - IDs to remove
   * @param options - Optional mutation options
   */
  async removeIdsFromArrayField(
    keyName: keyof TSchema,
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.removeIdsFromArrayField(keyName, ids, options);
  }
}
