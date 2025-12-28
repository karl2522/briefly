import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFolderDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    color?: string;
}
