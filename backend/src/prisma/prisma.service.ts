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
    // Add timeout to prevent hanging
    try {
      console.log('PrismaService: Connecting to database...');
      await Promise.race([
        this.$connect(),
        new Promise((_, reject) => 
          setTimeout(() => {
            reject(new Error('Database connection timeout after 10 seconds. Check DATABASE_URL and database accessibility.'));
          }, 10000)
        ),
      ]);
      console.log('PrismaService: Database connected successfully');
    } catch (error) {
      console.error('PrismaService: Database connection failed:', error);
      throw error;
    }
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



