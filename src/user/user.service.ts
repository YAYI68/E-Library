import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ICreateUser } from './types/user.type';
import { BorrowRepository } from 'src/book/repositories/borrow.repository';
import { QueryDto } from 'src/common/dto/common.dto';
import { PaginationHandler } from 'src/common/utils/pagination';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private userRepo: UserRepository,
    private borrowRepo: BorrowRepository,
     private readonly paginationHandler: PaginationHandler,
  ){

  }
  create(createUserDto: ICreateUser) {
    try{
       return this.userRepo.create(createUserDto);
    }
   catch(error){
     this.logger.error(`Error Creating a user: ${error.message}`, error.stack);
      throw new BadRequestException('Error Creating a user:')
   }
  }
  findById(id: number) {
    try{
       return this.userRepo.findById(id);
    }
   catch(error){
     this.logger.error(`Error: User not Found ${error.message}`, error.stack);
      throw new NotFoundException('User not Found')
   }
  }

   findByEmail(email: string) {
      try{
       return this.userRepo.findByEmail(email);
    }
   catch(error){
     this.logger.error(`Error: User not Found${error.message}`, error.stack);
      throw new NotFoundException('User not Found')
   }
  }
  async getBorrowedBooks(userId: number, queryDto: QueryDto){
    try{
       const queryArgs = this.paginationHandler.transform(queryDto)
        const result = await this.borrowRepo.getBorrowedBooks(userId,queryArgs )
         const response = this.paginationHandler.handlePagination({
          take: queryArgs?.limit,
          skip: queryArgs?.skip,
          data: result?.data,
          total: result?.total,
        });
        return {
          message:"Borrowed books fetched successfully",
          data: response
        }
    }
    catch(error){
       this.logger.error(`Error: fetching user borrowed books${error.message}`, error.stack);
      throw new BadRequestException('Error: fetching user borrowed books')
    }
  }
}
