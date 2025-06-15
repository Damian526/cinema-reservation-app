import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 120 })
  movieTitle: string;

  /* Kiedy zaczyna się seans */
  @Column({ type: 'datetime' })
  startTime: Date;

  /* Ile foteli ma sala */
  @Column({ type: 'smallint', unsigned: true })
  totalSeats: number;

  /* Ile miejsc jeszcze wolnych (zmniejszamy przy rezerwacji) */
  @Column({ type: 'smallint', unsigned: true, default: 0 })
  availableSeats: number;

  /* Optimistic Lock – wersja rekordu, chroni przed wyścigiem */
  @VersionColumn()
  version: number;

  /* Relacja odwrotna 1-do-wielu (seans → rezerwacje) */
  @OneToMany(() => Reservation, (r) => r.session)
  reservations: Reservation[];
}
