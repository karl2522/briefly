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
 * Used for both local development and Railway deployment
 */
export async function createNestApp(): Promise<INestApplication> {
  console.log('[createNestApp] Step 1: Creating NestJS application...');
  const createStartTime = Date.now();
  const app = await NestFactory.create(AppModule);
  console.log(`[createNestApp] Step 1 complete: App created in ${Date.now() - createStartTime}ms`);
  
  console.log('[createNestApp] Step 2: Getting ConfigService...');
  const configService = app.get(ConfigService);
  console.log('[createNestApp] Step 2 complete: ConfigService obtained');

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

  // CORS - Allow multiple origins for frontend deployments
  const frontendUrl = configService.get<string>('app.frontendUrl');
  const allowedOrigins = frontendUrl 
    ? [frontendUrl] 
    : [
        'http://localhost:3000',
        'https://localhost:3000',
        /^https:\/\/.*\.vercel\.app$/,  // Frontend on Vercel
        /^https:\/\/.*\.railway\.app$/, // Backend on Railway (for health checks)
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin matches allowed origins
      if (typeof allowedOrigins === 'string') {
        if (origin === allowedOrigins) {
          return callback(null, true);
        }
      } else if (Array.isArray(allowedOrigins)) {
        for (const allowedOrigin of allowedOrigins) {
          if (typeof allowedOrigin === 'string' && origin === allowedOrigin) {
            return callback(null, true);
          } else if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
            return callback(null, true);
          }
        }
      }
      
      // Log rejected origins for debugging
      console.log(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400, // Cache preflight requests for 24 hours
  });

  // Global prefix - always set for Railway and local development
  app.setGlobalPrefix('api');
  console.log('[createNestApp] Global prefix "api" set');

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

  // Initialize the app - required for route registration
  console.log('[createNestApp] Step 7: Initializing app...');
  const initStartTime = Date.now();
  
  await app.init();
  console.log(`[createNestApp] Step 7 complete: App initialized in ${Date.now() - initStartTime}ms`);
  
  // Verify routes are registered
  const routes = app.getHttpAdapter().getInstance()._router?.stack;
  console.log(`[createNestApp] Routes registered: ${routes ? routes.length : 'unknown'}`);
  
  console.log('[createNestApp] All steps complete, returning app');
  return app;
}

/**
 * Bootstrap function - runs the server
 * Works for both local development and Railway deployment
 */
async function bootstrap() {
  const app = await createNestApp();
  const configService = app.get(ConfigService);
  
  // Railway provides PORT environment variable, fallback to 3001 for local
  const port = process.env.PORT || configService.get<number>('app.port') || 3001;
  
  await app.listen(port);
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}/api`);
  console.log(`📡 Health check: http://0.0.0.0:${port}/api/health`);
}

// Bootstrap when this file is run directly (not imported)
if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}
