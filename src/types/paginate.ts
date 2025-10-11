export interface IPagination {
  limit: number;
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface WithPagination<T> {
  docs: T[];
  pagination: IPagination;
}
