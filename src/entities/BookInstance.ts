// src/entities/BookInstance.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Book } from './Book';
import { BookInstanceStatus } from '../utils/constants';
import { DateTime } from 'luxon'; // Import DateTime từ Luxon

@Entity()
export class BookInstance {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => Book, (book) => book.bookInstances)
  book: Book;

  @Column()
  imprint: string;

  @Column({
    type: 'enum',
    enum: Object.values(BookInstanceStatus),
  })
  status: string;

  @Column({ type: 'date' })
  dueBack: DateTime;

  // Phương thức getter cho URL
  get url(): string {
    return 'something';
  }
}
