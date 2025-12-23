import { Controller, Get, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as crypto from 'crypto';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('csrf-token')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  getCsrfToken(@Res() res: Response) {
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Set CSRF token in httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('csrf-token', csrfToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax', // Use 'lax' for cross-domain support (still secure)
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
    
    // Return token in response body (frontend will read this)
    return res.json({
      success: true,
      data: {
        csrfToken,
      },
    });
  }
}
