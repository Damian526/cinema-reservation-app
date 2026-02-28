import { IsArray, ArrayNotEmpty, IsInt, IsOptional } from 'class-validator';

export class ModifyReservationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  seatNumbers: number[];

  @IsOptional()
  @IsInt()
  expectedVersion?: number;
}
