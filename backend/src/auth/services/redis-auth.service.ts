import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Redis from 'ioredis';

/**
 * Redis service for OAuth authorization code storage
 * Implements OAuth 2.0 Authorization Code Flow
 */
@Injectable()
export class RedisAuthService {
    private redis: Redis;
    private readonly AUTH_CODE_PREFIX = 'auth_code:';
    private readonly AUTH_CODE_TTL = 60; // 60 seconds

    constructor(private configService: ConfigService) {
        // Initialize Redis client
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (redisUrl) {
            // Parse Railway Redis URL format: redis://default:password@host:port
            this.redis = new Redis(redisUrl);
        } else {
            // Fallback to individual config values
            this.redis = new Redis({
                host: this.configService.get<string>('app.redis.host'),
                port: this.configService.get<number>('app.redis.port'),
                password: this.configService.get<string>('app.redis.password'),
            });
        }

        this.redis.on('error', (err) => {
            console.error('[RedisAuthService] Redis connection error:', err);
        });

        this.redis.on('connect', () => {
            console.log('[RedisAuthService] Redis connected successfully');
        });
    }

    /**
     * Creates a temporary authorization code for OAuth flow
     * @param userId - User ID to associate with the code
     * @returns Authorization code (32 bytes hex string)
     */
    async createAuthCode(userId: string): Promise<string> {
        // Generate cryptographically random code
        const code = crypto.randomBytes(32).toString('hex');
        const key = `${this.AUTH_CODE_PREFIX}${code}`;

        // Store userId with TTL of 60 seconds
        await this.redis.setex(key, this.AUTH_CODE_TTL, userId);

        console.log(`[RedisAuthService] Created auth code for user ${userId}, expires in ${this.AUTH_CODE_TTL}s`);
        return code;
    }

    /**
     * Exchanges authorization code for user ID
     * Code is single-use and deleted after exchange
     * @param code - Authorization code
     * @returns User ID if code is valid, null otherwise
     */
    async exchangeAuthCode(code: string): Promise<string | null> {
        const key = `${this.AUTH_CODE_PREFIX}${code}`;

        // Get userId and delete code in one atomic operation
        const userId = await this.redis.get(key);

        if (!userId) {
            console.warn(`[RedisAuthService] Invalid or expired auth code attempted`);
            return null;
        }

        // Delete code immediately (single-use)
        await this.redis.del(key);

        console.log(`[RedisAuthService] Auth code exchanged successfully for user ${userId}`);
        return userId;
    }

    /**
     * Cleanup method for graceful shutdown
     */
    async onModuleDestroy() {
        await this.redis.quit();
    }
}
