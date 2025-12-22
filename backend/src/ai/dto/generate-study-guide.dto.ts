import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GenerateStudyGuideDto {
  @IsString({ message: 'Content is required.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @MinLength(10, { message: 'Content must be at least 10 characters long.' })
  content: string;

  @IsString({ message: 'Subject is required.' })
  @IsNotEmpty({ message: 'Subject cannot be empty.' })
  subject?: string;
}

