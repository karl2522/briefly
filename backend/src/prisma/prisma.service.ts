import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    // Connect to database when module initializes
    // Railway supports eager connections, no need for lazy loading
    try {
      console.log('[PrismaService] Starting database connection...');
      console.log('[PrismaService] DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      const startTime = Date.now();
      await Promise.race([
        this.$connect().then(() => {
          const duration = Date.now() - startTime;
          console.log(`[PrismaService] Database connected successfully in ${duration}ms`);
        }),
        new Promise((_, reject) => 
          setTimeout(() => {
            const duration = Date.now() - startTime;
            reject(new Error(`Database connection timeout after ${duration}ms. Check DATABASE_URL and database accessibility.`));
          }, 10000) // 10 second timeout
        ),
      ]);
    } catch (error) {
      console.error('[PrismaService] Database connection failed:', error);
      console.error('[PrismaService] Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async onModuleDestroy() {
    // Disconnect when module is destroyed
    await this.$disconnect();
  }

  /**
   * Cleanup method for application shutdown
   * Ensures connections are properly closed
   */
  async onApplicationShutdown() {
    await this.$disconnect();
  }
}



