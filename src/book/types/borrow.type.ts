export interface ICreateBorrowDto {
  user: { id: number };
  book: { id: number };
  borrowDate: Date;
  dueDate: Date 
}