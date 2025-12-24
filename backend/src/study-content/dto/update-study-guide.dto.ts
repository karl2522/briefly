import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStudyGuideDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @MaxLength(100000, { message: 'Content cannot exceed 100,000 characters' })
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Subject cannot exceed 200 characters' })
  subject?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Study guide cannot be empty' })
  @MaxLength(200000, { message: 'Study guide cannot exceed 200,000 characters' })
  studyGuide?: string;
}

