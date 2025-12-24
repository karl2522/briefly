import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip CSRF check for public routes (marked with @Public())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    // Get CSRF token from header
    const csrfToken = request.headers['x-csrf-token'] as string;
    
    // Get CSRF token from cookie
    const csrfCookie = request.cookies?.['csrf-token'];
    
    // Debug logging for CSRF token issues
    console.log('[CSRF Guard] Checking CSRF token:', {
      method: request.method,
      url: request.url,
      hasHeaderToken: !!csrfToken,
      hasCookieToken: !!csrfCookie,
      headerTokenLength: csrfToken?.length || 0,
      cookieTokenLength: csrfCookie?.length || 0,
      tokensMatch: csrfToken === csrfCookie,
      cookiesReceived: request.cookies ? Object.keys(request.cookies) : 'no cookies',
    });
    
    // Validate CSRF token
    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      console.error('[CSRF Guard] CSRF token validation failed:', {
        hasHeaderToken: !!csrfToken,
        hasCookieToken: !!csrfCookie,
        tokensMatch: csrfToken === csrfCookie,
      });
      throw new ForbiddenException('Invalid CSRF token');
    }
    
    console.log('[CSRF Guard] CSRF token validated successfully');

    return true;
  }
}

