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
      // Connection pool configuration for Neon PostgreSQL
      // Neon uses connection pooling, so we configure Prisma accordingly
    });
    
    // Handle connection errors gracefully
    this.$on('error' as never, (e: any) => {
      console.error('[PrismaService] Database error:', e);
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
      // Don't throw - allow app to start and retry on first query
      // This handles cases where database is temporarily unavailable
      console.warn('[PrismaService] App will continue, connection will be retried on first query');
    }
  }
  
  /**
   * Execute a query with automatic reconnection on connection errors
   */
  async executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
    try {
      return await queryFn();
    } catch (error: any) {
      // Check if error is a connection closed error
      if (error?.code === 'P1001' || error?.message?.includes('Closed') || error?.kind === 'Closed') {
        console.warn('[PrismaService] Connection closed, attempting to reconnect...');
        try {
          // Try to reconnect
          await this.$connect();
          console.log('[PrismaService] Reconnected successfully, retrying query...');
          // Retry the query once
          return await queryFn();
        } catch (reconnectError) {
          console.error('[PrismaService] Reconnection failed:', reconnectError);
          throw reconnectError;
        }
      }
      // Re-throw other errors
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



