import type { INestApplication } from '@nestjs/common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { safeLog } from './common/utils/logger.util';

const cookieParser = require('cookie-parser');

/**
 * Create and configure NestJS application
 * Used for both local development and Railway deployment
 */
export async function createNestApp(): Promise<INestApplication> {
  safeLog.log('[createNestApp] Step 1: Creating NestJS application...');
  const createStartTime = Date.now();
  const app = await NestFactory.create(AppModule);
  safeLog.log(`[createNestApp] Step 1 complete: App created in ${Date.now() - createStartTime}ms`);
  
  safeLog.log('[createNestApp] Step 2: Getting ConfigService...');
  const configService = app.get(ConfigService);
  safeLog.log('[createNestApp] Step 2 complete: ConfigService obtained');

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
  // Increased to 5MB to accommodate large study content (flashcards, quizzes, study guides)
  // Individual field limits enforced via DTO validators
  app.use(require('express').json({ limit: '5mb' })); // Limit JSON payloads to 5MB
  app.use(require('express').urlencoded({ limit: '5mb', extended: true })); // Limit URL-encoded payloads to 5MB

  // CORS - Allow multiple origins for frontend deployments
  const frontendUrl = configService.get<string>('app.frontendUrl');
  
  // Normalize frontend URL (remove trailing slash)
  const normalizedFrontendUrl = frontendUrl?.replace(/\/$/, '');
  
  // Build allowed origins list
  const allowedOrigins: (string | RegExp)[] = [];
  
  if (normalizedFrontendUrl) {
    allowedOrigins.push(normalizedFrontendUrl);
    safeLog.log(`[CORS] Frontend URL configured: ${normalizedFrontendUrl}`);
  }
  
  // Always allow localhost for development
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('https://localhost:3000');
  
  // Allow all Vercel domains (frontend deployments)
  allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
  
  // Allow Railway domains (for health checks and internal requests)
  allowedOrigins.push(/^https:\/\/.*\.railway\.app$/);
  
  safeLog.log(`[CORS] Allowed origins: ${JSON.stringify(allowedOrigins.map(o => o instanceof RegExp ? o.toString() : o))}`);
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        safeLog.log('[CORS] Request with no origin - allowing');
        return callback(null, true);
      }
      
      safeLog.log(`[CORS] Checking origin: ${origin}`);
      
      // Check if origin matches allowed origins
      for (const allowedOrigin of allowedOrigins) {
        if (typeof allowedOrigin === 'string') {
          // Exact match (normalize trailing slashes)
          const normalizedOrigin = origin.replace(/\/$/, '');
          if (normalizedOrigin === allowedOrigin || origin === allowedOrigin) {
            safeLog.log(`[CORS] Origin matched (exact): ${origin}`);
            return callback(null, true);
          }
        } else if (allowedOrigin instanceof RegExp) {
          if (allowedOrigin.test(origin)) {
            safeLog.log(`[CORS] Origin matched (regex): ${origin}`);
            return callback(null, true);
          }
        }
      }
      
      // Log rejected origins for debugging (errors always logged)
      safeLog.error(`[CORS] Rejected origin: ${origin}`);
      safeLog.error(`[CORS] Allowed origins were: ${JSON.stringify(allowedOrigins.map(o => o instanceof RegExp ? o.toString() : o))}`);
      safeLog.error(`[CORS] Frontend URL from config: ${normalizedFrontendUrl || 'not set'}`);
      // For debugging: test regex manually
      const vercelRegex = /^https:\/\/.*\.vercel\.app$/;
      safeLog.error(`[CORS] Regex test result: ${vercelRegex.test(origin)}`);
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
  safeLog.log('[createNestApp] Global prefix "api" set');

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
  safeLog.log('[createNestApp] Step 7: Initializing app...');
  const initStartTime = Date.now();
  
  await app.init();
  safeLog.log(`[createNestApp] Step 7 complete: App initialized in ${Date.now() - initStartTime}ms`);
  
  // Verify routes are registered
  const routes = app.getHttpAdapter().getInstance()._router?.stack;
  safeLog.log(`[createNestApp] Routes registered: ${routes ? routes.length : 'unknown'}`);
  
  safeLog.log('[createNestApp] All steps complete, returning app');
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
  safeLog.log(`🚀 Application is running on: http://0.0.0.0:${port}/api`);
  safeLog.log(`📡 Health check: http://0.0.0.0:${port}/api/health`);
}

// Bootstrap when this file is run directly (not imported)
if (require.main === module) {
  bootstrap().catch((error) => {
    safeLog.error('Failed to start application:', error);
    process.exit(1);
  });
}
