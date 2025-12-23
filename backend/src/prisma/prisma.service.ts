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
    // For serverless, use lazy connection - don't connect on module init
    // Connection will happen on first query automatically
    if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
      console.log('[PrismaService] Serverless mode: Skipping eager connection, will connect on first query');
      return;
    }
    
    // For local development, connect eagerly
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
          }, 5000)
        ),
      ]);
    } catch (error) {
      console.error('[PrismaService] Database connection failed:', error);
      console.error('[PrismaService] Error details:', error instanceof Error ? error.message : String(error));
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



