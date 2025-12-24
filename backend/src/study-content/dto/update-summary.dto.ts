import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateSummaryDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Text cannot be empty' })
  @MaxLength(100000, { message: 'Text cannot exceed 100,000 characters' })
  text?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Summary cannot be empty' })
  @MaxLength(50000, { message: 'Summary cannot exceed 50,000 characters' })
  summary?: string;

  @IsEnum(['short', 'medium', 'long'])
  @IsOptional()
  length?: 'short' | 'medium' | 'long';

  @IsInt()
  @Min(0)
  @IsOptional()
  originalLength?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  summaryLength?: number;
}


