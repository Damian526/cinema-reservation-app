import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('users')
export class User {
  /* PK – automatyczne, bezpieczne ID */
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /* Username musi być unikalny */
  @Column({ unique: true, length: 50 })
  username: string;

  /* E-mail musi być unikalny i często filtrowany → @Index */
  @Column({ unique: true, length: 120 })
  email: string;

  /* Przechowujemy zahashowane hasło */
  @Column()
  passwordHash: string;

  /* Rola; prosty ENUM pozwala łatwo dodać admina */
  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  /* Data założenia konta */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /* Relacja odwrotna 1-do-wielu (użytkownik → rezerwacje) */
  @OneToMany(() => Reservation, (r) => r.user)
  reservations: Reservation[];
}
