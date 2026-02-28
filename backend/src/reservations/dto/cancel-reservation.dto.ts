import { IsOptional, IsInt } from 'class-validator';

export class CancelReservationDto {
  @IsOptional()
  @IsInt()
  expectedVersion?: number;
}
