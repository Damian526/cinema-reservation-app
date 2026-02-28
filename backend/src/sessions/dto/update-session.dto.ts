import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional()
  @IsInt()
  @Min(0)
  availableSeats?: number;
}
