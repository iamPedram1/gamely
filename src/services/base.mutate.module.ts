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
  InternalServerError,
  NotFoundError,
  ValidationError,
} from 'utilites/errors';

// Types
import type { IApiBatchResponse } from 'utilites/response';
import type { BaseMutateOptions } from './base.service.type';

/**
 * Base service for CRUD and mutation operations on Mongoose models.
 */
class BaseMutateService<
  TSchema,
  TCreateDto = Partial<TSchema>,
  TUpdateDto = Partial<TSchema>,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> {
  constructor(protected readonly model: Model<TSchema>) {}

  // --------------------------------------------------------------------------
  // Create
  // --------------------------------------------------------------------------

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
      throw new InternalServerError(
        `${this.model.modelName} could not be created`
      );
    }

    if (options?.populate) {
      await (doc as any).populate(options.populate as any);
    }

    return doc as TDoc;
  }

  // --------------------------------------------------------------------------
  // Update Operations
  // --------------------------------------------------------------------------

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
      throw new NotFoundError(
        `${this.model.modelName} with id (${id}) not found`
      );
    }

    return doc as TThrowError extends true ? TDoc : TDoc | null;
  }

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
        `${this.model.modelName} with ${String(keyName)} not found`
      );
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError(
        `${this.model.modelName} matched but could not be updated`
      );
    }

    return result;
  }

  async updateManyByReference<K extends keyof TSchema>(
    id: string,
    referenceKey: K,
    value: TSchema[K],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.updateManyByReferences([id], referenceKey, value, options);
  }

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
      throw new NotFoundError(
        `No ${this.model.modelName} documents found with matching references`
      );
    }

    return result;
  }

  // --------------------------------------------------------------------------
  // Delete Operations
  // --------------------------------------------------------------------------

  async deleteOneById<TThrowError extends boolean = true>(
    id: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    const query = this.model.deleteOne({ _id: id } as FilterQuery<TSchema>);
    const result = await this.applyMutateOptions(query, options).exec();

    const deleted = result.deletedCount > 0;

    if ((options?.throwError ?? true) && !deleted) {
      throw new NotFoundError(
        `${this.model.modelName} with id (${id}) not found`
      );
    }

    return ((options?.throwError ?? true) ? true : deleted) as any;
  }

  async deleteManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    matchValue: any,
    options?: BaseMutateOptions
  ): Promise<DeleteResult> {
    const query = this.model.deleteMany({
      [keyName]: matchValue,
    } as FilterQuery<TSchema>);

    const result = await this.applyMutateOptions(query, options).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundError(
        `${this.model.modelName} with ${String(keyName)} not found`
      );
    }

    return result;
  }

  async batchDelete(
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<IApiBatchResponse> {
    if (!ids?.length) {
      throw new ValidationError('Ids array cannot be empty');
    }

    const query = this.model.deleteMany({
      _id: { $in: ids },
    } as FilterQuery<TSchema>);
    const result = await this.applyMutateOptions(query, options).exec();

    if (!result.acknowledged) {
      throw new InternalServerError(
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
          ? 'Deleted successfully'
          : 'Document not found',
      })),
      errors: failedIds.length > 0 ? ['Some documents not found'] : [],
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

  async removeIdFromArrayField(
    keyName: keyof AnyKeys<TSchema>,
    id: string,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    return this.removeIdsFromArrayField(keyName, [id], options);
  }

  async removeIdsFromArrayField(
    keyName: keyof TSchema,
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const query = this.model.updateMany(
      { [keyName]: { $in: ids } } as FilterQuery<TSchema>,
      { $pull: { [keyName]: { $in: ids } } } as UpdateQuery<TSchema>
    );

    const result = await this.applyMutateOptions(query, options).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `No ${this.model.modelName} documents found with matching ${String(keyName)}`
      );
    }

    return result;
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

    if (options.session) q = q.session(options.session);
    if (options.lean) q = q.lean();

    return q;
  }
}

export default BaseMutateService;
