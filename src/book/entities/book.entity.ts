import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Borrow } from './borrow.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ default: 0 })
  available_copies: number;

  @OneToMany(() => Borrow, borrow => borrow.book)
  borrows: Borrow[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}