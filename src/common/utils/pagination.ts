import { QueryDto } from './../dto/common.dto';
import { ReturnResponse } from "../types/common.type";


export interface PaginationType {
  limit: number;
  totalPages: number;
  pagingCounter: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  totalDocs: number;
  page: number;
}
export interface PaginationGlobalQueryParamsType<T> {
  take: number;
  skip: number;
  total: number;
  data: T[];
}

export class PaginationHandler {

//   Tranform page and limit to page and skip
  public transform(queryDto:QueryDto){
    const { page: rawPage, limit, q } = queryDto;
    const page = rawPage <= 0 ? 1 : rawPage; // Default page to 1 if <= 0
    const skip = (page - 1) * limit;
    return {q, skip, limit}
  }

  /**
   * To handle the pagination response
   */
  public handlePagination<T>(args: PaginationGlobalQueryParamsType<T>): ReturnResponse<T> {
    let pagination: PaginationType | object = {};
    if (args?.take !== undefined) {
      pagination = this.buildPagination(args?.total, {
        limit: args.take,
        page: this.safeDivide(args.skip, args.take) + 1,
      });
    }

    const response: ReturnResponse<T> = {
      data: args.data,
      ...pagination,
    };
    return response;
  }
  /**
   *
   */
  private buildPagination(total: number, query: any): PaginationType {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const totalPages = Math.ceil(total / limit);
    const pagingCounter = (page - 1) * limit + 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1 && page <= totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const prevPage = hasPrevPage ? page - 1 : null;
    const totalDocs = total;

    return {
      limit: limit,
      totalPages,
      pagingCounter,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      totalDocs,
      page: page,
    };
  }
  /**
   *
   */
  private safeDivide(numerator: number, denominator: number) {
    if (numerator === 0 && denominator === 0) {
      return 0;
    }
    return numerator / denominator;
  }
}
