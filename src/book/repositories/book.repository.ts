import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from 'typeorm';
import { Book } from "../entities/book.entity";
import { IQuery } from "src/common/types/common.type";
import { CreateBookDto } from "../dto/create-book.dto";




@Injectable()
export class BookRepository {
  constructor(
    @InjectRepository(Book)
    private bookModel: Repository<Book>,
  ) {}
  create(dto:CreateBookDto){
    const user = this.bookModel.create({
       ...dto
    });
    return this.bookModel.save(user);
  }

   async findAll(queryArgs: IQuery) {
    const { skip, limit, q } = queryArgs;
    const where = q ? { title: ILike(`%${q}%`) } : {};
    const [data, total] = await this.bookModel.findAndCount({
    where,
    skip,
    take: limit,
    order: { created_at: 'DESC' },
});
    return { data, total };
  }


  findById(id: number){
    return this.bookModel.findOneBy({id})
  }
 
  async update(id: number, dto: Partial<Book>) {
    await this.bookModel.update({ id }, dto);
    return this.findById(id); // Return the updated book
  }


}