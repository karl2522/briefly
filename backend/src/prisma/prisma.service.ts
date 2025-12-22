import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Optimize for serverless environments
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Connection pool settings for serverless
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    // Connect to database when module initializes
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect when module is destroyed (important for serverless)
    await this.$disconnect();
  }

  /**
   * Cleanup method for serverless environments
   * Ensures connections are properly closed
   */
  async onApplicationShutdown() {
    await this.$disconnect();
  }
}



