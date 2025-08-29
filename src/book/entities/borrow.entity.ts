// src/books/entities/borrow.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Book } from './book.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  borrowDate: Date;

  @Column({ type: 'datetime', nullable: true })
  returnDate: Date;
  
  @Column({ type: 'datetime', nullable: true })
  dueDate: Date;
  

  @ManyToOne(() => User, user => user.borrows)
  user: User;

  @ManyToOne(() => Book, book => book.borrows)
  book: Book;
}