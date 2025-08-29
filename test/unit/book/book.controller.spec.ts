
import { Test, TestingModule } from '@nestjs/testing';
import { CreateBookDto } from './../../../src/book/dto/create-book.dto';
import { BookService } from './../../../src/book/book.service';
import { BookController } from './../../../src/book/book.controller';
import { QueryDto } from 'src/common/dto/common.dto';
import { UserRole } from 'src/user/enums/user.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;
  let module: TestingModule;

  const fakeUser = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    role: UserRole.USER,
  };

  const createBookDto: CreateBookDto = {
    title: 'Test Book',
    author: 'Test Author',
    available_copies: 5,
  };

  const queryDto: QueryDto = {
    q: '',
    page: 1,
    limit: 10,
  };

  const fakeBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    available_copies: 5,
  };

  const paginatedResponse = {
    data: [fakeBook],
    limit: 10,
    totalPages: 1,
    pagingCounter: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    totalDocs: 1,
    page: 1,
  };

  const mockBookService = {
    create: jest.fn().mockResolvedValue(fakeBook),
    findAll: jest.fn().mockResolvedValue({
      message: 'All books fetch successfully',
      data: paginatedResponse,
    }),
    searchBook: jest.fn().mockResolvedValue({
      message: 'All books searched successfully',
      data: paginatedResponse,
    }),
    borrowBook: jest.fn().mockResolvedValue({ message: 'Book borrowed successfully' }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookController = module.get<BookController>(BookController);
    bookService = module.get<BookService>(BookService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    await module.close();
  });

  it('should be defined', () => {
    expect(bookController).toBeDefined();
    expect(bookService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const result = await bookController.create(createBookDto);
      expect(bookService.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(fakeBook);
    });

    it('should throw BadRequestException if creation fails', async () => {
      jest.spyOn(bookService, 'create').mockRejectedValue(new BadRequestException('Error creating a book'));
      await expect(bookController.create(createBookDto)).rejects.toThrow('Error creating a book');
      expect(bookService.create).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('findAll', () => {
    it('should fetch all books with pagination', async () => {
      const result = await bookController.findAll(queryDto);
      expect(bookService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        message: 'All books fetch successfully',
        data: paginatedResponse,
      });
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      jest.spyOn(bookService, 'findAll').mockRejectedValue(new Error('Error fetching books'));
      await expect(bookController.findAll(queryDto)).rejects.toThrow('Error fetching books');
      expect(bookService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('searchBook', () => {
    it('should search books with pagination', async () => {
      const result = await bookController.findOne(queryDto);
      expect(bookService.searchBook).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        message: 'All books searched successfully',
        data: paginatedResponse,
      });
    });

    it('should throw BadRequestException if search fails', async () => {
      jest.spyOn(bookService, 'searchBook').mockRejectedValue(new BadRequestException('Error occur while searching the book'));
      await expect(bookController.findOne(queryDto)).rejects.toThrow('Error occur while searching the book');
      expect(bookService.searchBook).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('borrowBook', () => {
    it('should borrow a book successfully', async () => {
      const result = await bookController.borrowBook('1', fakeUser);
      expect(bookService.borrowBook).toHaveBeenCalledWith(1, fakeUser);
      expect(result).toEqual({ message: 'Book borrowed successfully' });
    });

    it('should throw NotFoundException if book not found', async () => {
      jest.spyOn(bookService, 'borrowBook').mockRejectedValue(new NotFoundException('Book not found'));
      await expect(bookController.borrowBook('1', fakeUser)).rejects.toThrow('Book not found');
      expect(bookService.borrowBook).toHaveBeenCalledWith(1, fakeUser);
    });

    it('should throw BadRequestException if book is not available', async () => {
      jest.spyOn(bookService, 'borrowBook').mockRejectedValue(new BadRequestException('Book not available for borrowing'));
      await expect(bookController.borrowBook('1', fakeUser)).rejects.toThrow('Book not available for borrowing');
      expect(bookService.borrowBook).toHaveBeenCalledWith(1, fakeUser);
    });
  });
});