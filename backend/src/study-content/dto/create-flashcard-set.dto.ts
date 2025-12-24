import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateFlashcardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Question cannot exceed 5000 characters' })
  question: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000, { message: 'Answer cannot exceed 10000 characters' })
  answer: string;
}

export class CreateFlashcardSetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Topic cannot exceed 200 characters' })
  topic: string;

  @IsArray()
  @ArrayMaxSize(500, { message: 'Cannot exceed 500 flashcards per set' })
  @ValidateNested({ each: true })
  @Type(() => CreateFlashcardDto)
  flashcards: CreateFlashcardDto[];
}


