import type { WithPagination } from 'types/paginate';
import type { Query, Document, FlattenMaps, Aggregate, Model } from 'mongoose';

interface IPaginationConfig {
  page: number;
  limit: number;
}

/**
 * Paginates a Mongoose aggregation pipeline.
 * @param model - Mongoose model to execute aggregation on
 * @param pipeline - Aggregation pipeline array
 * @param configs - Pagination configs (page, limit)
 * @returns Paginated result with docs and pagination info
 */
export async function paginateAggregate<TResult>(
  model: Model<any>,
  pipeline: any[],
  configs?: Partial<IPaginationConfig>
): Promise<WithPagination<TResult>> {
  const currentPage = configs?.page || 1;
  const limit = configs?.limit || 20;
  const skip = calculateSkip(limit, currentPage);

  // Count total documents
  const countPipeline = [...pipeline, { $count: 'totalDocs' }];
  const countResult = await model.aggregate(countPipeline).exec();
  const totalDocs = countResult[0]?.totalDocs || 0;

  // Apply skip & limit to original pipeline
  const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
  const docs = await model.aggregate<TResult>(paginatedPipeline).exec();

  const totalPages = Math.ceil(totalDocs / limit);

  return {
    docs,
    pagination: {
      totalDocs,
      totalPages,
      currentPage,
      limit,
      hasPrevPage: calculateHasPrevPage(currentPage),
      hasNextPage: calculateHasNextPage(totalPages, currentPage),
    },
  };
}

export default async function paginate<TResult, TDoc>(
  query: Query<TResult[], TDoc>,
  configs?: Partial<IPaginationConfig>
): Promise<WithPagination<FlattenMaps<TResult>>> {
  const currentPage = configs?.page || 1;
  const limit = getValidLimit(configs?.limit || 20);
  const skip = calculateSkip(limit, currentPage);

  const model = query.model;
  const filter = query.getFilter();

  const [totalDocs, docs] = await Promise.all([
    model.countDocuments(filter),
    query.clone().skip(skip).limit(limit).exec() as Promise<
      FlattenMaps<TResult>[]
    >,
  ]);

  const totalPages = calculateTotalPages(totalDocs, limit);

  return {
    docs,
    pagination: {
      limit,
      totalDocs,
      currentPage,
      totalPages,
      hasPrevPage: calculateHasPrevPage(currentPage),
      hasNextPage: calculateHasNextPage(totalPages, currentPage),
    },
  };
}

function getValidLimit(limit: number) {
  const allowed = [10, 20, 40, 60, 80, 100];
  return allowed.includes(limit) ? limit : 20;
}

function calculateSkip(limit: number, page: number) {
  return Math.max(0, (page - 1) * limit);
}

function calculateHasNextPage(totalPages: number, page: number) {
  return page < totalPages;
}

function calculateHasPrevPage(page: number) {
  return page > 1;
}

function calculateTotalPages(totalDocs: number, limit: number) {
  return Math.ceil(totalDocs / limit);
}
