import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class GenerateFlashcardsDto {
  @IsString({ message: 'Text is required.' })
  @IsNotEmpty({ message: 'Text cannot be empty.' })
  @MinLength(10, { message: 'Text must be at least 10 characters long.' })
  @MaxLength(50000, { message: 'Text cannot exceed 50,000 characters.' })
  text: string;

  @IsOptional()
  @IsString({ message: 'Topic must be a string.' })
  @MaxLength(100, { message: 'Topic cannot exceed 100 characters.' })
  @Matches(/^[a-zA-Z0-9\s\-_.,!?]+$/, { message: 'Topic contains invalid characters.' })
  topic?: string;
}





