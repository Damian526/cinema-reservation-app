import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'smallint', unsigned: true })
  durationMinutes: number;

  @Column({ length: 60 })
  genre: string;

  @Column({ length: 100 })
  director: string;

  @Column({ type: 'varchar', length: 512, nullable: true, default: null })
  posterUrl: string | null;

  @Column({ type: 'smallint', unsigned: true })
  releaseYear: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.movie)
  sessions: Session[];
}
