import type { INestApplication } from '@nestjs/common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

const cookieParser = require('cookie-parser');

/**
 * Create and configure NestJS application
 * This function is used both for local development and serverless deployment
 */
export async function createNestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security - Configure Helmet with proper CSP and security headers
  const isProduction = configService.get<string>('app.nodeEnv') === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Next.js requires unsafe-inline/eval for dev
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: [
            "'self'",
            'https://generativelanguage.googleapis.com',
            'https://accounts.google.com',
            'https://www.facebook.com',
          ],
          fontSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: isProduction ? [] : null, // Only in production
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Request body size limits to prevent DoS attacks
  // Configure body parser limits (NestJS uses express under the hood)
  app.use(require('express').json({ limit: '1mb' })); // Limit JSON payloads to 1MB
  app.use(require('express').urlencoded({ limit: '1mb', extended: true })); // Limit URL-encoded payloads to 1MB

  // CORS
  const frontendUrl = configService.get<string>('app.frontendUrl');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400, // Cache preflight requests for 24 hours
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Enable detailed error messages - extract custom messages from decorators
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          // Extract constraint messages (these contain our custom messages from decorators)
          const constraints = error.constraints;
          if (constraints && Object.keys(constraints).length > 0) {
            // Return the first constraint message (which contains our custom message)
            return Object.values(constraints)[0] as string;
          }
          // Fallback if no constraints
          return `${error.property} has invalid value`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Initialize the app (don't call listen() for serverless)
  await app.init();

  return app;
}

/**
 * Bootstrap function for local development
 * Only runs when not in serverless environment
 */
async function bootstrap() {
  // Only start HTTP server if not in serverless environment
  if (process.env.VERCEL !== '1') {
    const app = await createNestApp();
    const configService = app.get(ConfigService);
    const port = configService.get<number>('app.port') || 3001;
    
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  }
}

// Only bootstrap if running locally (not in Vercel)
if (require.main === module && process.env.VERCEL !== '1') {
  bootstrap();
}
