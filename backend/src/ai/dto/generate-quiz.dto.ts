import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class GenerateQuizDto {
  @IsString({ message: 'Content is required.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @MinLength(10, { message: 'Content must be at least 10 characters long.' })
  content: string;

  @IsNumber({}, { message: 'Number of questions must be a number.' })
  @Min(1, { message: 'Number of questions must be at least 1.' })
  numberOfQuestions?: number = 5;

  @IsString({ message: 'Difficulty must be a string.' })
  difficulty?: 'easy' | 'medium' | 'hard' = 'medium';
}

