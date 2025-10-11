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
import type {
  BaseMutateOptions,
  IBaseMutateService,
} from './base.service.type';

export default class BaseMutateService<
  TSchema,
  TCreateDto,
  TUpdateDto,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> implements IBaseMutateService<TSchema, TCreateDto, TUpdateDto, TDoc>
{
  protected readonly model: Model<TSchema>;

  constructor(model: Model<TSchema>) {
    this.model = model;
  }

  async deleteOneById(
    id: string,
    options?: BaseMutateOptions
  ): Promise<DeleteResult> {
    const q = this.model.deleteOne({ _id: id });

    this.applyMutateOptions(q, options);

    const result = await q.exec();

    if (result.deletedCount === 0) {
      throw new NotFoundError(
        `${this.model.modelName} with the given id was not found`
      );
    }

    return result;
  }

  async deleteManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    matchValue: TSchema[typeof keyName],
    options?: BaseMutateOptions
  ): Promise<DeleteResult> {
    const q = this.model.deleteMany({
      [keyName]: matchValue,
    } as FilterQuery<TSchema>);

    this.applyMutateOptions(q, options);
    const result = await q.exec();

    if (result.deletedCount === 0) {
      throw new NotFoundError(
        `${this.model.modelName} with the given ${String(keyName || 'key')} was not found`
      );
    }

    return await q.exec();
  }

  async batchDelete(
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<IApiBatchResponse> {
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      throw new ValidationError('Ids field cannot be empty');

    // Single bulk delete
    let q = this.model.deleteMany({ _id: { $in: ids } });
    this.applyMutateOptions(q, options);

    const result = await q.exec();
    if (!result.acknowledged) {
      throw new InternalServerError(
        `Batch delete failed for ${this.model.modelName}`
      );
    }

    // All IDs that were successfully deleted
    const successIds = ids.slice(0, result.deletedCount);
    const failedIds = ids.slice(result.deletedCount);

    return {
      results: ids.map((id) => ({
        id,
        success: successIds.includes(id),
        message: successIds.includes(id)
          ? 'Deleted successfully'
          : 'Document does not exist',
      })),
      errors: failedIds.length > 0 ? ['Some documents not found'] : [],
      failedIds,
      successIds,
      totalCount: ids.length,
      successCount: result.deletedCount,
      isAllSucceed: result.deletedCount === ids.length,
    };
  }

  async removeIdFromArrayField(
    keyName: keyof AnyKeys<TSchema>,
    id: string,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const q = this.model.updateMany(
      { [keyName]: { $in: [id] } } as FilterQuery<TSchema>,
      { $pull: { [keyName]: id } } as
        | UpdateWithAggregationPipeline
        | UpdateQuery<TSchema>
    );

    this.applyMutateOptions(q, options);

    const result = await q.exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `No ${this.model.modelName} documents found containing id in '${String(
          keyName
        )}'`
      );
    }

    return result;
  }

  async removeIdsFromArrayField(
    keyName: keyof TSchema,
    ids: string[],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const q = this.model.updateMany(
      { [keyName]: { $in: ids } } as FilterQuery<TSchema>,
      { $pull: { [keyName]: { $in: ids } } } as
        | UpdateWithAggregationPipeline
        | UpdateQuery<TSchema>
    );

    this.applyMutateOptions(q, options);

    const result = await q.exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `No ${this.model.modelName} documents found containing given IDs`
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
    const q = this.model.updateMany(
      { [referenceKey]: id } as FilterQuery<TSchema>,
      { [referenceKey]: value } as
        | UpdateWithAggregationPipeline
        | UpdateQuery<TSchema>
    );

    this.applyMutateOptions(q, options);

    const result = await q.exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `No ${this.model.modelName} documents found matching given reference`
      );
    }

    return result;
  }

  async updateManyByReferences<K extends keyof TSchema>(
    id: string[],
    referenceKey: K,
    value: TSchema[K],
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const q = this.model.updateMany(
      { [referenceKey]: { $in: id } } as FilterQuery<TSchema>,
      { [referenceKey]: value } as
        | UpdateWithAggregationPipeline
        | UpdateQuery<TSchema>
    );

    this.applyMutateOptions(q, options);

    const result = await q.exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `No ${this.model.modelName} documents found matching given references`
      );
    }

    return result;
  }

  async create(
    data: Partial<TCreateDto>,
    userId?: string,
    options: BaseMutateOptions = {}
  ): Promise<TDoc> {
    const { session } = options;

    const doc = (await new this.model({
      ...data,
      ...(userId && { creator: userId }),
    }).save({ session })) as TDoc;

    if (!doc)
      throw new InternalServerError(
        `${this.model.modelName} could not be created`
      );

    return doc;
  }

  async updateOneById(
    id: string,
    payload: Partial<TUpdateDto>,
    options?: BaseMutateOptions
  ): Promise<TDoc> {
    let q: Query<TDoc | null, TDoc> = this.model.findByIdAndUpdate(
      id,
      payload as unknown as UpdateQuery<TSchema>,
      { new: true }
    );

    this.applyMutateOptions(q, options);

    const doc = await q.exec();

    if (!doc) {
      throw new NotFoundError(
        `${this.model.modelName} with the given id was not found`
      );
    }

    return doc;
  }

  async updateManyByKey(
    keyName: keyof AnyKeys<TSchema>,
    matchValue: TSchema[typeof keyName],
    data: UpdateWithAggregationPipeline | UpdateQuery<TSchema>,
    options?: BaseMutateOptions
  ): Promise<UpdateResult> {
    const q = this.model.updateMany(
      { [keyName]: matchValue } as FilterQuery<TSchema>,
      data
    );

    this.applyMutateOptions(q, options);

    const result = await q.exec();

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `${this.model.modelName} with the given ${String(keyName)} was not found`
      );
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError(
        `${this.model.modelName} documents matched but could not be updated`
      );
    }

    return result;
  }

  private applyMutateOptions(
    query: Query<any, any>,
    options?: BaseMutateOptions
  ): Query<TDoc | null, TDoc> {
    if (!options) return query;

    if (options.session && 'session' in query)
      query = query.session(options.session);
    if (options.lean && 'lean' in query) query = query.lean();

    return query;
  }
}
