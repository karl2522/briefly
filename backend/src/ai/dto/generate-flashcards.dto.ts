import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GenerateFlashcardsDto {
  @IsString({ message: 'Text is required.' })
  @IsNotEmpty({ message: 'Text cannot be empty.' })
  @MinLength(10, { message: 'Text must be at least 10 characters long.' })
  text: string;

  @IsString({ message: 'Topic is required.' })
  @IsNotEmpty({ message: 'Topic cannot be empty.' })
  topic?: string;
}

