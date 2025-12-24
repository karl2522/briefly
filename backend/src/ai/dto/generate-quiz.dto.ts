import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class GenerateQuizDto {
  @IsString({ message: 'Content is required.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @MinLength(10, { message: 'Content must be at least 10 characters long.' })
  @MaxLength(50000, { message: 'Content cannot exceed 50,000 characters.' })
  content: string;

  @IsOptional()
  @IsNumber({}, { message: 'Number of questions must be a number.' })
  @Min(1, { message: 'Number of questions must be at least 1.' })
  @Max(50, { message: 'Number of questions cannot exceed 50.' })
  numberOfQuestions?: number = 5;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'], { message: 'Difficulty must be one of: easy, medium, or hard.' })
  difficulty?: 'easy' | 'medium' | 'hard' = 'medium';
}



