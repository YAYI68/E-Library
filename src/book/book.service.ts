import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { BookRepository } from './repositories/book.repository';
import { PaginationHandler } from 'src/common/utils/pagination';
import { QueryDto } from 'src/common/dto/common.dto';
import { BorrowRepository } from './repositories/borrow.repository';
import { THIRD_PARTY_VENDOR_TYPES } from 'src/third-party/constants';
import { LibraryGatewayInterface } from 'src/third-party/interface/library-gateway.interface';
import { User } from 'src/user/entities/user.entity';
import { IUser } from 'src/user/types/user.type';

@Injectable()
export class BookService {
    private readonly logger = new Logger(BookService.name);
    constructor(
      private bookRepo: BookRepository,
      private borrowRepo: BorrowRepository,
      private readonly paginationHandler: PaginationHandler,
      @Inject(THIRD_PARTY_VENDOR_TYPES.Library_GATEWAY_PROVIDER)
      private readonly libraryGateway: LibraryGatewayInterface,
    ){
  
    }
  async create(createBookDto: CreateBookDto) {
    try{
       const book  = await this.bookRepo.create(createBookDto)
       return book
    }
    catch(error){
       this.logger.error(`Error creating a book: ${error.message}`, error.stack);
        throw new BadRequestException('Error creating a book:')
    }
  }

  async findAll(queryDto: QueryDto) {
    try{
      const queryArgs = this.paginationHandler.transform(queryDto)
       const result = await this .bookRepo.findAll(queryArgs)
       const response = this.paginationHandler.handlePagination({
      take: queryArgs?.limit,
      skip: queryArgs?.skip,
      data: result?.data,
      total: result?.total,
    });
    return {
      message: 'All books fetch successfully',
      data: response
    }
    }
    catch(error){
       this.logger.error(`Error fetching books: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Error fetching books')
    }
  }

  async findOne(id: number) {
    try{
      const book = await this.bookRepo.findById(id)
      return {
      message: 'book fetch successfully',
      data: book
    }
    }
    catch(error){
      this.logger.error(`Error fetching a book: ${error.message}`, error.stack);
        throw new BadRequestException('Error fetching a book')
    }
  }

  async borrowBook(id: number, user: IUser) {
  try {
    const book = await this.bookRepo.findById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.available_copies <= 0) {
      throw new BadRequestException('Book not available for borrowing!!!!!!!!!');
    }

    // Check for existing unreturned borrow
    const existingBorrow = await this.borrowRepo.findExistingBorrow(user.id, book.id);
    if (existingBorrow) {
      throw new BadRequestException('User has already borrowed this book and not returned it');
    }

    // Calculate due date (2 weeks from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create borrowed book record
    await this.borrowRepo.create({
      user: { id: user.id },
      book: { id: book.id },
      borrowDate: new Date(),
      dueDate,
    });
    // Update available copies
    await this.bookRepo.update(book.id, { available_copies: book.available_copies - 1 });

    return { message: 'Book borrowed successfully' };
  } catch (error) {
    this.logger.error(`Error occurred while borrowing a book: ${error.message}`, error.stack);
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
    throw error;
  }
    throw new InternalServerErrorException('An unexpected error occurred while borrowing a book');
  }
}

  async searchBook(queryDto: QueryDto) {
    try{
       const queryArgs = this.paginationHandler.transform(queryDto)
       const result = await this .libraryGateway.search(queryDto)
       const response = this.paginationHandler.handlePagination({
      take: queryArgs?.limit,
      skip: queryArgs?.skip,
      data: result?.data,
      total: result?.total,
    });
     return {
      message: 'All books searched successfully',
      data: response
    }
    }
    catch(error){
      this.logger.error(`Error searching a book: ${JSON.stringify(error)}`);
        throw new BadRequestException('Error occur while searching the book')
    }
  }
}
