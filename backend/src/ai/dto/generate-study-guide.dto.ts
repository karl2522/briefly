import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class GenerateStudyGuideDto {
  @IsString({ message: 'Content is required.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @MinLength(10, { message: 'Content must be at least 10 characters long.' })
  @MaxLength(50000, { message: 'Content cannot exceed 50,000 characters.' })
  content: string;

  @IsOptional()
  @IsString({ message: 'Subject must be a string.' })
  @MaxLength(100, { message: 'Subject cannot exceed 100 characters.' })
  @Matches(/^[a-zA-Z0-9\s\-_.,!?]+$/, { message: 'Subject contains invalid characters.' })
  subject?: string;
}





