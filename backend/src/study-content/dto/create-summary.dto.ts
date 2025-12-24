import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateSummaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100000, { message: 'Text cannot exceed 100,000 characters' })
  text: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000, { message: 'Summary cannot exceed 50,000 characters' })
  summary: string; // Generated summary

  @IsEnum(['short', 'medium', 'long'])
  length: 'short' | 'medium' | 'long';

  @IsInt()
  @Min(0)
  originalLength: number;

  @IsInt()
  @Min(0)
  summaryLength: number;
}

