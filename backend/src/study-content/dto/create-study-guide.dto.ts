import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStudyGuideDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100000, { message: 'Content cannot exceed 100,000 characters' })
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Subject cannot exceed 200 characters' })
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200000, { message: 'Study guide cannot exceed 200,000 characters' })
  studyGuide: string; // Generated content
}


