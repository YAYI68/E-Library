
import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './../../../src/book/book.service';
import { BookRepository } from './../../../src/book/repositories/book.repository';
import { BorrowRepository } from 'src/book/repositories/borrow.repository';
import { CreateBookDto } from './../../../src/book/dto/create-book.dto';
import { QueryDto } from 'src/common/dto/common.dto';
import { UserRole } from 'src/user/enums/user.enum';
import { PaginationHandler } from 'src/common/utils/pagination';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { THIRD_PARTY_VENDOR_TYPES } from 'src/third-party/constants';
import { LibraryGatewayInterface } from 'src/third-party/interface/library-gateway.interface';


describe('BookService', () => {
  let bookService: BookService;
  let bookRepo: BookRepository;
  let borrowRepo: BorrowRepository;
  let paginationHandler: PaginationHandler;
  let libraryGateway: LibraryGatewayInterface;
  let module: TestingModule;

  const fakeUser = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    borrows: [],
    created_at: new Date(),
  };

  const createBookDto: CreateBookDto = {
    title: 'Test Book',
    author: 'Test Author',
    available_copies: 5,
  };

  const queryDto: QueryDto = {
    q:'',
    page: 1,
    limit: 10,
  };

 
  const fakeBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    available_copies: 5,
    borrows: [],
    created_at: new Date(),
  };

 const fakeBorrow = {
  id: 1,
  borrowDate: new Date(),
  returnDate: null,
  dueDate: new Date,
  user: fakeUser,
  book: fakeBook,
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

  const mockBookRepo = {
    create: jest.fn().mockResolvedValue(fakeBook),
    findAll: jest.fn().mockResolvedValue({ data: [fakeBook], total: 1 }),
    findById: jest.fn().mockResolvedValue(fakeBook),
    update: jest.fn().mockResolvedValue(fakeBook),
  };

  const mockBorrowRepo = {
    create: jest.fn().mockResolvedValue({ id: 1, userId: fakeUser.id, bookId: fakeBook.id }),
    findExistingBorrow: jest.fn().mockResolvedValue(null),
  };

  const mockPaginationHandler = {
    transform: jest.fn().mockReturnValue({ skip: 0, limit: 10 }),
    handlePagination: jest.fn().mockReturnValue(paginatedResponse),
  };

  const mockLibraryGateway = {
    search: jest.fn().mockResolvedValue({ data: [fakeBook], total: 1 }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: BookRepository,
          useValue: mockBookRepo,
        },
        {
          provide: BorrowRepository,
          useValue: mockBorrowRepo,
        },
        {
          provide: PaginationHandler,
          useValue: mockPaginationHandler,
        },
        {
          provide: THIRD_PARTY_VENDOR_TYPES.Library_GATEWAY_PROVIDER,
          useValue: mockLibraryGateway,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    bookRepo = module.get<BookRepository>(BookRepository);
    borrowRepo = module.get<BorrowRepository>(BorrowRepository);
    paginationHandler = module.get<PaginationHandler>(PaginationHandler);
    libraryGateway = module.get<LibraryGatewayInterface>(THIRD_PARTY_VENDOR_TYPES.Library_GATEWAY_PROVIDER);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    await module.close();
  });

  it('should be defined', () => {
    expect(bookService).toBeDefined();
    expect(bookRepo).toBeDefined();
    expect(borrowRepo).toBeDefined();
    expect(paginationHandler).toBeDefined();
    expect(libraryGateway).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const result = await bookService.create(createBookDto);
      expect(bookRepo.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(fakeBook);
    });

    it('should throw BadRequestException if creation fails', async () => {
      jest.spyOn(bookRepo, 'create').mockRejectedValue(new Error('Database error'));
      await expect(bookService.create(createBookDto)).rejects.toThrow(BadRequestException);
      expect(bookRepo.create).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('findAll', () => {
    it('should fetch all books with pagination', async () => {
      const result = await bookService.findAll(queryDto);
      expect(paginationHandler.transform).toHaveBeenCalledWith(queryDto);
      expect(bookRepo.findAll).toHaveBeenCalledWith({ skip: 0, limit: 10 });
      expect(paginationHandler.handlePagination).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        data: [fakeBook],
        total: 1,
      });
      expect(result).toEqual({
        message: 'All books fetch successfully',
        data: paginatedResponse,
      });
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      jest.spyOn(bookRepo, 'findAll').mockRejectedValue(new Error('Database error'));
      await expect(bookService.findAll(queryDto)).rejects.toThrow(InternalServerErrorException);
      expect(paginationHandler.transform).toHaveBeenCalledWith(queryDto);
      expect(bookRepo.findAll).toHaveBeenCalledWith({ skip: 0, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should fetch a single book by ID', async () => {
      const result = await bookService.findOne(1);
      expect(bookRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'book fetch successfully',
        data: fakeBook,
      });
    });

    it('should throw BadRequestException if fetching fails', async () => {
      jest.spyOn(bookRepo, 'findById').mockRejectedValue(new Error('Database error'));
      await expect(bookService.findOne(1)).rejects.toThrow(BadRequestException);
      expect(bookRepo.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('borrowBook', () => {

    it('should throw NotFoundException if book not found', async () => {
      jest.spyOn(bookRepo, 'findById').mockResolvedValue(null);
      await expect(bookService.borrowBook(1, fakeUser)).rejects.toThrow(NotFoundException);
      expect(bookRepo.findById).toHaveBeenCalledWith(1);
      expect(borrowRepo.findExistingBorrow).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if book is not available', async () => {
      jest.spyOn(bookRepo, 'findById').mockResolvedValue({ ...fakeBook, available_copies: 0 });
      await expect(bookService.borrowBook(1, fakeUser)).rejects.toThrow(BadRequestException);
      expect(bookRepo.findById).toHaveBeenCalledWith(1);
      expect(borrowRepo.findExistingBorrow).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      jest.spyOn(bookRepo, 'findById').mockRejectedValue(new Error('Database error'));
      await expect(bookService.borrowBook(1, fakeUser)).rejects.toThrow(InternalServerErrorException);
      expect(bookRepo.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('searchBook', () => {
    it('should search books using external API with pagination', async () => {
      const result = await bookService.searchBook(queryDto);
      expect(paginationHandler.transform).toHaveBeenCalledWith(queryDto);
      expect(libraryGateway.search).toHaveBeenCalledWith(queryDto);
      expect(paginationHandler.handlePagination).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        data: [fakeBook],
        total: 1,
      });
      expect(result).toEqual({
        message: 'All books searched successfully',
        data: paginatedResponse,
      });
    });

    it('should throw BadRequestException if search fails', async () => {
      jest.spyOn(libraryGateway, 'search').mockRejectedValue(new Error('API error'));
      await expect(bookService.searchBook(queryDto)).rejects.toThrow(BadRequestException);
      expect(paginationHandler.transform).toHaveBeenCalledWith(queryDto);
      expect(libraryGateway.search).toHaveBeenCalledWith(queryDto);
    });
  });
});