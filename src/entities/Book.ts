// src/entities/Book.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Author } from './Author';
import { BookInstance } from './BookInstance';
import { BookGenre } from './BookGenre';

@Entity()
export class Book {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column()
  title: string;

  @Column('text')
  summary: string;

  @Column()
  ISBN: string;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;

  @OneToMany(() => BookGenre, (bookGenre) => bookGenre.book)
  bookGenres: BookGenre[];

  @OneToMany(() => BookInstance, (bookInstance) => bookInstance.book)
  bookInstances: BookInstance[];

  // Phương thức getter cho URL
  get url(): string {
    return 'something';
  }
}
