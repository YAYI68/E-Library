import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueryDto } from 'src/common/dto/common.dto';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { IUser } from 'src/user/types/user.type';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}
  
  @ApiOperation({ summary: 'Add a new book (admin only)' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }
  
  @ApiOperation({ summary: 'Fetch All Books)' })
  @ApiResponse({ status: 200, description: 'books fetch successfully' })
  @Get()
  findAll(@Query() queryDto: QueryDto) {
    return this.bookService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Search books from external api)' })
  @ApiResponse({ status: 200, description: 'All books searched successfully' })
  @Get('search')
  findOne(@Query() queryDto: QueryDto) {
    return this.bookService.searchBook(queryDto);
  }
  
  @ApiOperation({ summary: 'Borrow a book' })
  @ApiResponse({ status: 200, description: 'Book borrowed successfully' })
  @ApiResponse({ status: 400, description: 'Book not available or already borrowed' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/borrow')
  borrowBook(@Param('id') id: string, @CurrentUser() user: IUser) {
    return this.bookService.borrowBook(+id, user);
  }
}
