import { IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    { message: 'Avatar must be a valid URL starting with http:// or https://' },
  )
  @Matches(/^https?:\/\//, { message: 'Avatar URL must start with http:// or https://' })
  @MaxLength(500, { message: 'Avatar URL cannot exceed 500 characters.' })
  avatar?: string;
}


