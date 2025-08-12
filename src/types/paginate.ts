export interface IPagination {
  totalDocs: number;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface WithPagination<T> {
  docs: T[];
  pagination: IPagination;
}
