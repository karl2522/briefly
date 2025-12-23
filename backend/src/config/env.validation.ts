import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Matches, MinLength, ValidateIf, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment;

  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsOptional()
  @ValidateIf((o) => {
    const value = o.DATABASE_URL;
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed !== '' && trimmed !== undefined && trimmed !== null;
  })
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/, { 
    message: 'DATABASE_URL must be a valid database connection URL (e.g., postgresql://user:pass@host:port/db)' 
  })
  DATABASE_URL?: string;

  @IsOptional()
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+[smhd]$/, { message: 'JWT_EXPIRES_IN must be in format: number + unit (s/m/h/d), e.g., 15m, 1h, 7d' })
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET must be at least 32 characters long' })
  JWT_REFRESH_SECRET?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+[smhd]$/, { message: 'JWT_REFRESH_EXPIRES_IN must be in format: number + unit (s/m/h/d), e.g., 15m, 1h, 7d' })
  JWT_REFRESH_EXPIRES_IN?: string;

  @ValidateIf((o) => {
    const value = o.FRONTEND_URL;
    const isProduction = o.NODE_ENV === 'production';
    return isProduction && value !== undefined && value !== null && value !== '';
  })
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'FRONTEND_URL must be a valid URL starting with http:// or https://' })
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'GOOGLE_CLIENT_SECRET must be at least 20 characters long' })
  GOOGLE_CLIENT_SECRET?: string;

  @ValidateIf((o) => {
    const value = o.GOOGLE_CALLBACK_URL;
    const isProduction = o.NODE_ENV === 'production';
    return isProduction && value !== undefined && value !== null && value !== '';
  })
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'GOOGLE_CALLBACK_URL must be a valid URL' })
  GOOGLE_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  FACEBOOK_APP_ID?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'FACEBOOK_APP_SECRET must be at least 20 characters long' })
  FACEBOOK_APP_SECRET?: string;

  @ValidateIf((o) => {
    const value = o.FACEBOOK_CALLBACK_URL;
    const isProduction = o.NODE_ENV === 'production';
    return isProduction && value !== undefined && value !== null && value !== '';
  })
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'FACEBOOK_CALLBACK_URL must be a valid URL' })
  FACEBOOK_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'GEMINI_API_KEY must be at least 20 characters long' })
  GEMINI_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  // Filter out empty strings and whitespace-only strings, treat them as undefined
  const cleanedConfig: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (value === '' || (typeof value === 'string' && value.trim() === '')) {
      cleanedConfig[key] = undefined;
    } else if (typeof value === 'string') {
      // Trim whitespace from string values
      cleanedConfig[key] = value.trim();
    } else {
      cleanedConfig[key] = value;
    }
  }
  
  // Debug logging for DATABASE_URL (masked for security)
  if (cleanedConfig.DATABASE_URL) {
    const dbUrl = cleanedConfig.DATABASE_URL as string;
    const maskedUrl = dbUrl.length > 20 
      ? `${dbUrl.substring(0, 10)}...${dbUrl.substring(dbUrl.length - 10)}` 
      : '***';
    console.log(`[Env Validation] DATABASE_URL present: ${maskedUrl}, length: ${dbUrl.length}, starts with: ${dbUrl.substring(0, 10)}`);
  } else {
    console.log('[Env Validation] DATABASE_URL is missing or empty');
  }
  
  const validatedConfig = plainToInstance(EnvironmentVariables, cleanedConfig, {
    enableImplicitConversion: true,
  });
  
  // In production, validate all required fields strictly
  // In development, allow missing optional fields
  const isProduction = cleanedConfig.NODE_ENV === 'production';
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: !isProduction,
    skipNullProperties: !isProduction,
    skipUndefinedProperties: !isProduction,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        const propertyValue = validatedConfig[error.property as keyof EnvironmentVariables];
        const valuePreview = typeof propertyValue === 'string' && propertyValue.length > 50
          ? `${propertyValue.substring(0, 50)}...`
          : propertyValue;
        return `- property ${error.property} (value: ${JSON.stringify(valuePreview)}) has failed the following constraints: ${constraints}`;
      })
      .join('\n');
    
    throw new Error(`An instance of EnvironmentVariables has failed the validation:\n${errorMessages}`);
  }
  return validatedConfig;
}



