export interface SearchBookDto {
    title: string;
    author?: string;   
}

export interface SearchBookResultDto<T> {
  total: number
  data: T[]   
}