import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  movieId?: number | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  movieTitle: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  @IsPositive()
  totalSeats: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsInt()
  @IsPositive()
  roomNumber: number;
}
