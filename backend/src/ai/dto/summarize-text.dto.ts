import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SummarizeTextDto {
  @IsString({ message: 'Text is required.' })
  @IsNotEmpty({ message: 'Text cannot be empty.' })
  @MinLength(10, { message: 'Text must be at least 10 characters long.' })
  text: string;

  @IsString({ message: 'Length must be a string.' })
  length?: 'short' | 'medium' | 'long' = 'medium';
}

