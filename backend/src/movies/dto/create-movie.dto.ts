import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsUrl,
  IsPositive,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  @Max(600)
  durationMinutes: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  genre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  director: string;

  @IsUrl({}, { message: 'posterUrl must be a URL address' })
  @IsOptional()
  @ValidateIf(o => o.posterUrl !== '' && o.posterUrl !== null)
  posterUrl?: string;

  @IsInt()
  @Min(1888)
  @Max(2100)
  releaseYear: number;
}
