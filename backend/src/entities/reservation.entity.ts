import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Session } from './session.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /* Kto rezerwuje – usunięcie konta usuwa rezerwacje */
  @ManyToOne(() => User, (u) => u.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /* Na jaki seans – usunięcie seansu usuwa rezerwacje */
  @ManyToOne(() => Session, (s) => s.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  /* Ile miejsc jednorazowo */
  @Column({ type: 'smallint', unsigned: true })
  seatsBooked: number;

  /* Numery zarezerwowanych miejsc (JSON array) */
  @Column({ type: 'json', nullable: true })
  seatNumbers: number[];

  /* Zapisujemy czas dokonania rezerwacji */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reservedAt: Date;
}
