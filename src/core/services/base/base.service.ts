import { startSession } from 'mongoose';

// Services
import BaseQueryService from 'core/services/base/base.query.service';
import BaseMutateService from 'core/services/base/base.mutate.service';
import BaseValidationService from 'core/services/base/base.validation.service';

// Utilities
import { AnonymousError } from 'core/utilities/errors';
import { QueryFilterBuilder } from 'core/utilities/filter';
import { IApiBatchResponse } from 'core/utilities/response';
import {
  i18nInstance,
  t as translator,
  userContext,
} from 'core/utilities/request-context';

// Types
import type { i18n } from 'i18next';
import type { DocumentId } from 'core/types/common';
import type { TranslationKeys, TranslationVariables } from 'core/types/i18n';
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
  Types,
  FilterQuery,
} from 'mongoose';
import type {
  AggregateReturn,
  BaseMutateOptions,
  BaseQueryOptions,
  BuildQuery,
  FindResult,
  IBaseMutateService,
  IBaseQueryService,
  IBaseService,
  IBaseValidationService,
  NestedKeyOf,
  NestedValueOf,
  NullableQueryResult,
  OrAndFilter,
  RelatedLookup,
} from 'core/types/base.service.type';

type Q<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = IBaseQueryService<TSchema, TDoc>;

type V<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = IBaseValidationService<TSchema, TDoc>;

type M<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> = IBaseMutateService<TSchema, TCreateDto, TUpdateDto, TDoc>;

export type BaseTFunction = <T extends TranslationKeys>(
  key: TranslationKeys,
  options?: Partial<TranslationVariables<T>>
) => string;

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
  protected readonly queries: Q<TSchema, TDoc>;
  protected readonly mutations: M<TSchema, TCreateDto, TUpdateDto, TDoc>;
  protected readonly validations: V<TSchema, TDoc>;
  private _currentUser?: ReturnType<typeof userContext>;
  private _softCurrentUser?: ReturnType<typeof userContext> | null;

  constructor(private model: Model<TSchema>) {
    this.mutations = new BaseMutateService(model, this.t);
    this.queries = new BaseQueryService<TSchema, TDoc>(model, this.t);
    this.validations = new BaseValidationService(model, this.queries, this.t);
  }

  protected get currentUser() {
    try {
      return userContext();
    } catch (error) {
      throw new AnonymousError('Something wrong with user context');
    }
  }

  protected get softCurrentUser() {
    try {
      return userContext();
    } catch {
      return null;
    }
  }

  /**
   * Translates a given key using the current request's translation function.
   *
   * ******* Model name automatically passed to options argument in base service *******
   *
   * Throws an {@link AnonymousError} if no translation function is available.
   *
   * @template T - A translation key type.
   * @param {T} key - The translation key to look up.
   * @param {Partial<TranslationVariables<T>>} [options] - Optional variables for interpolation.
   * @returns {string} The translated string.
   *
   * @throws {AnonymousError} If no translation context is available.
   */
  protected t<T extends TranslationKeys>(
    key: T,
    options?: Partial<TranslationVariables<T>>
  ): string {
    const opts = {
      model: translator(
        `models.${this.model.modelName}.singular` as TranslationKeys
      ),
      ...options,
    } as unknown as TranslationVariables<T>;

    return translator(key, opts);
  }

  /**
   * i18n Instance
   **/
  protected get i18n(): i18n {
    return i18nInstance();
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
      await session.endSession();
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
   * Checks if a document exists by complex condition.
   * @param slug - Slug to match.
   * @returns True if a document exists, false otherwise.
   */
  async existsByCondition(filter: FilterQuery<TSchema>): Promise<boolean> {
    return this.queries.existsByCondition(filter);
  }

  /**
   * Checks if a document exists by a specific key-value pair.
   * @param key - Field name to match.
   * @param match - Value to compare.
   * @returns True if a document exists, false otherwise.
   */
  async existsByKey<K extends NestedKeyOf<TSchema>>(
    key: K,
    match: NestedValueOf<TSchema, K>
  ): Promise<boolean> {
    return this.queries.existsByKey(key, match);
  }

  async isMadeBySelf(documentId: string, userId: string): Promise<boolean> {
    return this.queries.isMadeBySelf(documentId, userId);
  }

  // =====================
  // COUNT OPERATIONS
  // =====================

  async countDocuments(filter: FilterQuery<TSchema>): Promise<number> {
    return this.queries.countDocuments(filter);
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
   *  - `query`: query parameters for the `paginate` utility
   * @returns Either a paginated result or an array of documents.
   */
  async find<TLean extends boolean = false, TPaginate extends boolean = true>(
    options?:
      | (BaseQueryOptions<TSchema, boolean> & {
          lean?: TLean | undefined;
          paginate?: TPaginate | undefined;
        })
      | undefined
  ): Promise<FindResult<TSchema, TDoc, TLean, TPaginate>> {
    return await this.queries.find(options);
  }

  /**
   * Builds a powerful, type-safe Mongoose filter object
   * with advanced filtering capabilities.
   */
  public async buildFilterFromQuery<TQuery extends Record<string, any>>(
    query: TQuery,
    rules: BuildQuery<TQuery, TSchema>
  ): Promise<FilterQuery<TSchema>> {
    const builder = new QueryFilterBuilder<TSchema>(query, rules);
    return await builder.build();
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
   * Add counts of related collections to documents.
   *
   * Example:
   * ```ts
   * // Count posts and comments for each tag
   * const result = await service.findWithRelatedCounts([
   *   { from: 'posts', localField: '_id', foreignField: 'tags', asField: 'postsCount' },
   *   { from: 'comments', localField: '_id', foreignField: 'tags', asField: 'commentsCount' },
   * ]);
   *
   * // Count only published posts
   * const filtered = await service.findWithRelatedCounts([
   *   { from: 'posts', localField: '_id', foreignField: 'tags', asField: 'postsCount', matchStage: { status: 'published' } },
   * ], { paginate: false });
   * ```
   *
   * @param lookups Related collections to count
   * @param options Optional query options (pagination, sorting, etc.)
   * @returns Documents with added count fields
   */
  async findWithRelatedCounts<
    TResult = TSchema,
    TPaginate extends boolean | undefined = true,
  >(
    lookups: RelatedLookup<TSchema>[],
    options?: BaseQueryOptions<TSchema> & { paginate?: TPaginate }
  ): Promise<AggregateReturn<TResult, TPaginate>> {
    return this.queries.findWithRelatedCounts(lookups, options);
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
    id: DocumentId,
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TSchema, TDoc, TLean, TThrowError>> {
    return this.queries.getOneById(id, options);
  }

  /**
   * Retrieves a single document by filter object.
   * @param filter - Filter Object.
   * @param options - Query customization options:
   *  - `select`: fields to include/exclude
   *  - `populate`: relations to populate
   *  - `lean`: if true, returns a plain JS object instead of a hydrated doc
   *  - `throwError`: if true (default), throws NotFoundError when not found
   * @returns The found document or null (if throwError=false).
   * @throws {NotFoundError} If document not found and throwError is true.
   */
  async getOneByCondition<
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    filter: FilterQuery<TSchema>,
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TSchema, TDoc, TLean, TThrowError>> {
    return this.queries.getOneByCondition(filter, options);
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
        ? FlattenMaps<TSchema>
        : TDoc
      : TLean extends true
        ? FlattenMaps<TSchema> | null
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
    K extends NestedKeyOf<TSchema>,
    TLean extends boolean = false,
    TThrowError extends boolean = true,
  >(
    key: K,
    value: NestedValueOf<TSchema, K>,
    options?: Omit<BaseQueryOptions<TSchema>, 'filter'> & {
      lean?: TLean;
      throwError?: TThrowError;
    }
  ): Promise<NullableQueryResult<TSchema, TDoc, TLean, TThrowError>> {
    return this.queries.getOneByKey(key, value, options);
  }

  // =====================
  // CREATE OPERATIONS
  // =====================

  /**
   * Creates a new document.
   * @param data - Data to create the document with.
   * @param options - Mongoose session or populate options.
   * @returns Created document.
   * @throws {AnonymousError} If creation fails.
   */
  async create<TThrowError extends boolean = true>(
    data: TCreateDto,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? TDoc : TDoc | null> {
    return this.mutations.create(data, options);
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
    id: DocumentId,
    payload: UpdateQuery<TSchema>,
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
   * @throws {AnonymousError} If matched documents cannot be updated.
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
  async updateManyByReference<K extends NestedKeyOf<TSchema>>(
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
   * Updates multiple documents based on complex filter conditions.
   *
   * @template TSchema - The Mongoose schema type.
   * @param {OrAndFilter<TSchema> | FilterQuery<TSchema>} conditions - Filter object or combination of $or/$and queries.
   * @param {UpdateWithAggregationPipeline | UpdateQuery<TSchema>} data - Data or aggregation pipeline to update the matched documents.
   * @param {Object} [options] - Optional settings (e.g., session, throwError).
   * @param {boolean} [options.throwError=true] - Whether to throw an error if no documents match.
   * @returns {Promise<UpdateResult>} - The result of the update operation.
   * @throws {Error} - If no documents match the conditions.
   */
  async updateManyWithConditions<TThrowError extends boolean = true>(
    conditions: OrAndFilter<TSchema> | FilterQuery<TSchema>,
    data: UpdateWithAggregationPipeline | UpdateQuery<TSchema>,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ) {
    return this.mutations.updateManyWithConditions(conditions, data, options);
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
  async updateManyByReferences<K extends NestedKeyOf<TSchema>>(
    referenceIds: string[],
    referenceKey: K,
    value: NestedValueOf<TSchema, K>,
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
    id: DocumentId,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    return this.mutations.deleteOneById(id, options);
  }

  /**
   * Deletes a document by complex filter object.
   * @param filter - filter object.
   * @param options - Options including session or throwError flag.
   * @returns True if deleted, otherwise false.
   * @throws {NotFoundError} If document not found and throwError is true.
   */
  async deleteOneByCondition<TThrowError extends boolean = true>(
    filter: FilterQuery<TSchema>,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    return this.mutations.deleteOneByCondition(filter, options);
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
   * @throws {AnonymousError} If deletion fails.
   */
  async batchDelete(
    ids: string[],
    options?: BaseMutateOptions & { additionalFilter?: FilterQuery<TSchema> }
  ): Promise<IApiBatchResponse> {
    return this.mutations.batchDelete(ids, options);
  }

  /**
   * Deletes multiple documents based on complex filter conditions.
   *
   * @template TSchema - The Mongoose schema type.
   * @param {OrAndFilter<TSchema> | FilterQuery<TSchema>} conditions - Filter object or combination of $or/$and queries.
   * @param {BaseMutateOptions} [options] - Optional settings (e.g., session, throwError).
   * @param {boolean} [options.throwError=true] - Whether to throw an error if no documents match.
   * @returns {Promise<import('mongoose').DeleteResult>} - The result of the delete operation.
   * @throws {Error} - If throwError is true and no documents match the conditions.
   */

  async deleteManyWithConditions<TThrowError extends boolean = false>(
    conditions: OrAndFilter<TSchema> | FilterQuery<TSchema>,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<DeleteResult> {
    return this.mutations.deleteManyWithConditions(conditions, options);
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
    keyName: NestedKeyOf<TSchema>,
    id: DocumentId,
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
    keyName: NestedKeyOf<TSchema>,
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.mutations.removeIdsFromArrayField(keyName, ids, options);
  }

  // =====================
  // VALIDATIONS
  // =====================
  async assertOwnership(document: string | Record<'creator', Types.ObjectId>) {
    return this.validations.assertOwnership(document);
  }

  /**
   * Sets a field on a Mongoose document if the value is defined (not undefined or null).
   *
   * @template TDoc - The Mongoose document type.
   * @template TKey - The keys of the schema that can be updated.
   * @param {TDoc} doc - The Mongoose document to update.
   * @param {TKey} key - The key of the field to update.
   * @param {TDoc[TKey] | undefined | null} value - The value to set. Will only set if value is not undefined or null.
   */
  async setIfDefined<TDoc extends Record<string, any>, TKey extends keyof TDoc>(
    doc: TDoc,
    key: TKey,
    value: TDoc[TKey] | string | undefined | null
  ) {
    if (value !== undefined && value !== null) {
      doc.set(key, value);
    }
  }
}
