import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import envConfig from './config/env.config';
import { validate } from './config/env.validation';
import { FoldersModule } from './folders/folders.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudyContentModule } from './study-content/study-content.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    // Rate limiting with Redis storage
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Parse REDIS_URL if provided (Railway format: redis://default:password@host:port)
        // Otherwise use individual REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
        const redisUrl = process.env.REDIS_URL;
        let redisConfig: { host: string; port: number; password?: string };

        if (redisUrl) {
          // Parse REDIS_URL
          const url = new URL(redisUrl);
          redisConfig = {
            host: url.hostname,
            port: parseInt(url.port || '6379', 10),
            password: url.password || undefined,
          };
          console.log('[Redis] Using REDIS_URL:', { host: redisConfig.host, port: redisConfig.port });
        } else {
          // Use individual env vars
          redisConfig = {
            host: configService.get<string>('app.redis.host') || 'localhost',
            port: configService.get<number>('app.redis.port') || 6379,
            password: configService.get<string>('app.redis.password'),
          };
          console.log('[Redis] Using individual env vars:', { host: redisConfig.host, port: redisConfig.port });
        }

        return {
          throttlers: [
            {
              ttl: 60000, // 1 minute
              limit: 20, // Conservative default for auth endpoints
            },
          ],
          storage: new ThrottlerStorageRedisService(redisConfig),
        };
      },
    }),
    // Prisma module
    PrismaModule,
    // Auth module
    AuthModule,
    // Users module
    UsersModule,
    // AI module
    AiModule,
    // Study content module
    StudyContentModule,
    // Folders module
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
