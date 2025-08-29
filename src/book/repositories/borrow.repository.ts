import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from 'typeorm';
import { Borrow } from "../entities/borrow.entity";
import { ICreateBorrowDto } from "../types/borrow.type";
import { Book } from "../entities/book.entity";
import { IQuery } from "src/common/types/common.type";




@Injectable()
export class BorrowRepository {
  constructor(
    @InjectRepository(Borrow)
    private borrowModel: Repository<Borrow>,
  ) {}
  create(dto:ICreateBorrowDto){
    const borrow = this.borrowModel.create({
       ...dto
    });
    return this.borrowModel.save(borrow);
  }


  findById(id: number){
    return this.borrowModel.findOneBy({id})
  }

  async findExistingBorrow(userId: number, bookId: number) {
    return this.borrowModel.findOne({
      select: ['id'],
      where: {
        user: { id: userId },
        book: { id: bookId },
        returnDate: IsNull(),
      },
    });
  }

 async getBorrowedBooks(userId: number, queryArgs: IQuery) {
  const { skip, limit } = queryArgs;
  
  const [data, total] = await this.borrowModel.findAndCount({
    where: { user: { id: userId } },
    relations: ['book'],
    skip,
    take: limit,
    order: { borrowDate: 'DESC' },
  });
  return { data, total };
  }

}