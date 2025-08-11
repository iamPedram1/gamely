export interface PaginationProps {
  totalDocs: number;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface WithPagination<T> {
  docs: T[];
  pagination: PaginationProps;
}
