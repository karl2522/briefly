import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUrl, Matches, MinLength, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'DATABASE_URL must be a valid URL' })
  DATABASE_URL: string;

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  JWT_SECRET: string;

  @IsString()
  @Matches(/^\d+[smhd]$/, { message: 'JWT_EXPIRES_IN must be in format: number + unit (s/m/h/d), e.g., 15m, 1h, 7d' })
  JWT_EXPIRES_IN: string;

  @IsString()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET must be at least 32 characters long' })
  JWT_REFRESH_SECRET: string;

  @IsString()
  @Matches(/^\d+[smhd]$/, { message: 'JWT_REFRESH_EXPIRES_IN must be in format: number + unit (s/m/h/d), e.g., 15m, 1h, 7d' })
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'FRONTEND_URL must be a valid URL starting with http:// or https://' })
  FRONTEND_URL: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @MinLength(20, { message: 'GOOGLE_CLIENT_SECRET must be at least 20 characters long' })
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'GOOGLE_CALLBACK_URL must be a valid URL' })
  GOOGLE_CALLBACK_URL: string;

  @IsString()
  FACEBOOK_APP_ID: string;

  @IsString()
  @MinLength(20, { message: 'FACEBOOK_APP_SECRET must be at least 20 characters long' })
  FACEBOOK_APP_SECRET: string;

  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'FACEBOOK_CALLBACK_URL must be a valid URL' })
  FACEBOOK_CALLBACK_URL: string;

  @IsString()
  @MinLength(20, { message: 'GEMINI_API_KEY must be at least 20 characters long' })
  GEMINI_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}



