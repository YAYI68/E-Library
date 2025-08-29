export type ReturnResponse<T> = {
  data: T[];
  limit?: number;
  totalPages?: number;
  pagingCounter?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
  totalDocs?: number;
  page?: number;
};

export class IQuery {
  q?: string 
  skip: number 
  limit: number
}