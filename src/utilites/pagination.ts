import type { PaginationProps, WithPagination } from 'types/paginate';
import type { Query, Document, FlattenMaps, Model } from 'mongoose';

interface PaginationConfigProps {
  page: number;
  limit: number;
}

export default async function paginate<TResult, TDoc extends Document>(
  query: Query<TResult[], TDoc>,
  configs?: PaginationConfigProps
): Promise<WithPagination<FlattenMaps<TResult>>> {
  const currentPage = configs?.page || 1;
  const limit = configs?.limit || 20;
  const validLimit = getValidLimit(limit);
  const skip = calculateSkip(validLimit, currentPage);

  const model = query.model;
  const filter = query.getFilter();

  const [totalDocs, docs] = await Promise.all([
    model.countDocuments(filter),
    query.clone().skip(skip).limit(validLimit).lean().exec() as Promise<
      FlattenMaps<TResult>[]
    >,
  ]);

  const totalPages = calculateTotalPages(totalDocs, validLimit);

  return {
    docs,
    pagination: {
      totalDocs,
      currentPage,
      totalPages,
      hasPrevPage: calculateHasPrevPage(currentPage),
      hasNextPage: calculateHasNextPage(totalPages, currentPage),
    },
  };
}

function getValidLimit(limit: number) {
  const allowed = [2, 10, 20, 40, 60, 80, 100];
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
