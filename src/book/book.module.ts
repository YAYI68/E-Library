import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { BookRepository } from './repositories/book.repository';
import { BorrowRepository } from './repositories/borrow.repository';
import { Borrow } from './entities/borrow.entity';
import { PaginationHandler } from 'src/common/utils/pagination';
import { ThirdPartyModule } from 'src/third-party/third-party.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book,Borrow]), ThirdPartyModule],
  controllers: [BookController],
  providers: [BookService, BookRepository, BorrowRepository, PaginationHandler],
  exports:[BorrowRepository]
})
export class BookModule {}
