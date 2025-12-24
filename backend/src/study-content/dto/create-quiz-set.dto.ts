import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreateQuizQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Question cannot exceed 5000 characters' })
  question: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Must have at least 2 options' })
  @ArrayMaxSize(10, { message: 'Cannot exceed 10 options per question' })
  @IsString({ each: true })
  @MaxLength(1000, { each: true, message: 'Each option cannot exceed 1000 characters' })
  @IsNotEmpty()
  options: string[];

  @IsInt()
  @Min(0)
  correctAnswer: number; // Index of correct option (0-based)
}

export class CreateQuizSetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Topic cannot exceed 200 characters' })
  topic: string;

  @IsInt()
  @Min(1)
  @Max(50)
  numberOfQuestions: number;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @IsArray()
  @ArrayMaxSize(100, { message: 'Cannot exceed 100 questions per quiz' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}

