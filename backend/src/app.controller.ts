import { Controller, Get, Res } from '@nestjs/common';
import * as crypto from 'crypto';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { safeLog } from './common/utils/logger.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

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
  getCsrfToken(@Res() res: Response) {
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');

    // Set CSRF token in httpOnly cookie
    // For cross-domain requests (frontend on Vercel, backend on Railway):
    // Use sameSite: 'none' with secure: true
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('csrf-token', csrfToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production (required for sameSite: 'none')
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // 'none' for cross-domain, 'lax' for same-domain
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      // NO domain attribute - cookies will be scoped to backend domain
    });

    safeLog.log('[CSRF Token] Setting cookie with options:', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
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
