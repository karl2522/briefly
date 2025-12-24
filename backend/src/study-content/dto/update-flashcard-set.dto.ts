import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateFlashcardDto } from './create-flashcard-set.dto';

export class UpdateFlashcardSetDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Topic cannot be empty' })
  @MaxLength(200, { message: 'Topic cannot exceed 200 characters' })
  topic?: string;

  @IsArray()
  @ArrayMaxSize(500, { message: 'Cannot exceed 500 flashcards per set' })
  @ValidateNested({ each: true })
  @Type(() => CreateFlashcardDto)
  @IsOptional()
  flashcards?: CreateFlashcardDto[];
}


