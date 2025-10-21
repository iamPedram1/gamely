import type {
  Model,
  Query,
  HydratedDocument,
  FilterQuery,
  UpdateResult,
  DeleteResult,
  AnyKeys,
  UpdateWithAggregationPipeline,
  UpdateQuery,
} from 'mongoose';

// Utilities
import {
  AnonymousError,
  NotFoundError,
  ValidationError,
} from 'core/utilites/errors';

// Types
import type { TypedTFunction } from 'core/types/i18n';
import type { IApiBatchResponse } from 'core/utilites/response';
import type { BaseMutateOptions } from '../../types/base.service.type';
import type { BaseTFunction } from 'core/services/base/base.service';

/**
 * Base service for CRUD and mutation operations on Mongoose models.
 */
class BaseMutateService<
  TSchema,
  TCreateDto = Partial<TSchema>,
  TUpdateDto = Partial<TSchema>,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> {
  constructor(
    protected readonly model: Model<TSchema>,
    protected readonly t: BaseTFunction
  ) {}

  // --------------------------------------------------------------------------
  // Create
  // --------------------------------------------------------------------------
  /**
   * Creates a new document.
   * @param data - Data to create the document with.
   * @param userId - Optional creator ID to attach.
   * @param options - Mongoose session or populate options.
   * @returns Created document.
   * @throws {AnonymousError} If creation fails.
   */
  async create<TThrowError extends boolean = true>(
    data: TCreateDto,
    userId?: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? TDoc : TDoc | null> {
    const doc = await new this.model({
      ...data,
      ...(userId && { creator: userId }),
    } as any).save({ session: options?.session });

    if (!doc && (options?.throwError ?? true)) {
      throw new AnonymousError(`${this.model.modelName} could not be created`);
    }

    if (options?.populate) {
      await (doc as any).populate(options.populate as any);
    }

    return doc as TDoc;
  }

  // --------------------------------------------------------------------------
  // Update Operations
  // --------------------------------------------------------------------------
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
    const query = this.model.findByIdAndUpdate(
      id,
      payload as unknown as UpdateQuery<TSchema>,
      { new: true }
    );

    const doc = await this.applyMutateOptions(query, options).exec();

    if (!doc && (options?.throwError ?? true)) {
      throw new NotFoundError(this.t('error.not_found_by_id', { id }));
    }

    return doc as TThrowError extends true ? TDoc : TDoc | null;
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
    matchValue: any,
    data: UpdateWithAggregationPipeline | UpdateQuery<TSchema>,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const query = this.model.updateMany(
      { [keyName]: matchValue } as FilterQuery<TSchema>,
      data
    );

    const result = await this.applyMutateOptions(query, options).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        this.t('error.not_found_by_key', { key: String(keyName) })
      );
    }

    if (result.modifiedCount === 0) {
      throw new AnonymousError(
        `${this.model.modelName} matched but could not be updated`
      );
    }

    return result;
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
    id: string,
    referenceKey: K,
    value: TSchema[K],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.updateManyByReferences([id], referenceKey, value, options);
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
    ids: string[],
    referenceKey: K,
    value: TSchema[K],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const query = this.model.updateMany(
      { [referenceKey]: { $in: ids } } as FilterQuery<TSchema>,
      { [referenceKey]: value } as UpdateQuery<TSchema>
    );

    const result = await this.applyMutateOptions(query, options).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(this.t('error.no_documents_with_references'));
    }

    return result;
  }

  // --------------------------------------------------------------------------
  // Delete Operations
  // --------------------------------------------------------------------------
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
    const query = this.model.deleteOne({ _id: id } as FilterQuery<TSchema>);
    const result = await this.applyMutateOptions(query, options).exec();

    const deleted = result.deletedCount > 0;

    if ((options?.throwError ?? true) && !deleted) {
      throw new NotFoundError(this.t('error.not_found_by_id', { id }));
    }

    return ((options?.throwError ?? true) ? true : deleted) as any;
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
    const query = this.model.deleteMany({
      [keyName]: matchValue,
    } as FilterQuery<TSchema>);

    const result = await this.applyMutateOptions(query, options).exec();

    if ((options?.throwError ?? false) && result.deletedCount === 0) {
      throw new NotFoundError(
        this.t('error.not_found_by_key_value', {
          key: String(keyName),
          value: String(matchValue),
        })
      );
    }

    return result;
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
    if (!ids?.length) {
      throw new ValidationError(this.t('error.ids_array_empty'));
    }

    console.log('Batch Delete', {
      _id: { $in: ids },
      ...options?.additionalFilter,
      options,
    });

    const query = this.model.deleteMany({
      _id: { $in: ids },
      ...options?.additionalFilter,
    } as FilterQuery<TSchema>);
    const result = await this.applyMutateOptions(query, options).exec();

    if (!result.acknowledged) {
      throw new AnonymousError(
        `Batch delete failed for ${this.model.modelName}`
      );
    }

    const successIds = ids.slice(0, result.deletedCount);
    const failedIds = ids.slice(result.deletedCount);

    return {
      results: ids.map((id) => ({
        id,
        success: successIds.includes(id),
        message: successIds.includes(id)
          ? this.t('common.deleted_successfully')
          : this.t('error.not_found_by_id', { id }),
      })),
      errors:
        failedIds.length > 0 ? [this.t('common.some_documents_not_found')] : [],
      failedIds,
      successIds,
      totalCount: ids.length,
      successCount: result.deletedCount,
      isAllSucceed: result.deletedCount === ids.length,
    };
  }

  // --------------------------------------------------------------------------
  // Array Field Operations
  // --------------------------------------------------------------------------
  /**
   * Removes an ID from array fields in all matching documents.
   * @param keyName - Array field name.
   * @param id - ID to remove.
   * @param options - Mutation options.
   * @returns MongoDB update result.
   */
  async removeIdFromArrayField(
    keyName: keyof AnyKeys<TSchema>,
    id: string,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.removeIdsFromArrayField(keyName, [id], options);
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
    const query = this.model.updateMany(
      { [keyName]: { $in: ids } } as FilterQuery<TSchema>,
      { $pull: { [keyName]: { $in: ids } } } as UpdateQuery<TSchema>
    );

    return await this.applyMutateOptions(query, options).exec();
  }

  // --------------------------------------------------------------------------
  // Options Application
  // --------------------------------------------------------------------------

  /**
   * Applies common mutate options such as session or lean.
   * @param query - Mongoose query.
   * @param options - Session or lean options.
   * @returns Modified query instance.
   */
  protected applyMutateOptions<TResult = any>(
    query: Query<TResult, any>,
    options?: BaseMutateOptions
  ): Query<any, any> {
    if (!options) return query as any;

    let q: any = query;

    if (options.session && 'session' in q) q = q.session(options.session);
    if (options.lean && 'lean' in q) q = q.lean();

    return q;
  }
}

export default BaseMutateService;
