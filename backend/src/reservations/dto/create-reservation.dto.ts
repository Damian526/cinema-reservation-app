import {
  IsInt,
  IsPositive,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsString,
  IsEmail,
} from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsPositive()
  sessionId: number;

  @IsInt()
  @IsPositive()
  seatsCount: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatNumbers: number[];

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;
}
