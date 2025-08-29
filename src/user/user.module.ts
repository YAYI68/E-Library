import { BookModule } from './../book/book.module';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { BorrowRepository } from 'src/book/repositories/borrow.repository';
import { PaginationHandler } from 'src/common/utils/pagination';

@Module({
  imports: [TypeOrmModule.forFeature([User]), BookModule],
  controllers: [UserController],
  providers: [UserService,UserRepository, PaginationHandler],
  exports:[UserService,UserRepository ]
})
export class UserModule {}
