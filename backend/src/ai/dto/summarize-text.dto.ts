import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SummarizeTextDto {
  @IsString({ message: 'Text is required.' })
  @IsNotEmpty({ message: 'Text cannot be empty.' })
  @MinLength(10, { message: 'Text must be at least 10 characters long.' })
  @MaxLength(50000, { message: 'Text cannot exceed 50,000 characters.' })
  text: string;

  @IsOptional()
  @IsEnum(['short', 'medium', 'long'], { message: 'Length must be one of: short, medium, or long.' })
  length?: 'short' | 'medium' | 'long' = 'medium';
}



