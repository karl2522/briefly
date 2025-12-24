import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { CreateQuizQuestionDto } from './create-quiz-set.dto';

export class UpdateQuizSetDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Topic cannot be empty' })
  @MaxLength(200, { message: 'Topic cannot exceed 200 characters' })
  topic?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  numberOfQuestions?: number;

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsArray()
  @ArrayMaxSize(100, { message: 'Cannot exceed 100 questions per quiz' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  @IsOptional()
  questions?: CreateQuizQuestionDto[];
}


