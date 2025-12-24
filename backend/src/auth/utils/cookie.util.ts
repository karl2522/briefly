import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

/**
 * Sets authentication tokens in httpOnly cookies
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  configService: ConfigService,
): void {
  const isProduction = configService.get<string>('app.nodeEnv') === 'production';
  const jwtExpiresIn = configService.get<string>('app.jwt.expiresIn') || '15m';
  const refreshExpiresIn = configService.get<string>('app.jwt.refreshExpiresIn') || '7d';

  // Calculate expiration times in milliseconds
  const accessTokenMaxAge = parseExpirationToMs(jwtExpiresIn);
  const refreshTokenMaxAge = parseExpirationToMs(refreshExpiresIn);

  // For cross-domain cookies (frontend on Vercel, backend on Railway):
  // DO NOT set domain attribute - let browser use default (backend domain)
  // Cookies will be sent automatically with credentials: 'include' from frontend
  // Setting domain would restrict cookies to that domain, breaking cross-domain auth

  // Set access token cookie (short-lived)
  // For cross-domain cookies (frontend on Vercel, backend on Railway):
  // Use sameSite: 'none' with secure: true for cross-domain requests
  // Use sameSite: 'lax' for same-domain or OAuth redirects
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production (required for sameSite: 'none')
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // 'none' for cross-domain, 'lax' for same-domain
    maxAge: accessTokenMaxAge,
    path: '/',
    // NO domain attribute - cookies will be scoped to backend domain
    // Browser will send them automatically with credentials: 'include'
  };
  
  console.log('[setAuthCookies] Setting cookies with options:', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    maxAge: cookieOptions.maxAge,
    path: cookieOptions.path,
    domain: 'NOT SET (scoped to backend domain)',
    isProduction,
  });
  
  res.cookie('accessToken', accessToken, cookieOptions);

  // Set refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, cookieOptions);
  
  console.log('[setAuthCookies] Cookies set successfully');
}

/**
 * Clears authentication cookies
 */
export function clearAuthCookies(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Clear cookies without domain attribute (matches how they were set)
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    // NO domain attribute - matches how cookie was set
  };
  
  res.clearCookie('accessToken', clearOptions);
  res.clearCookie('refreshToken', clearOptions);
}

/**
 * Parses expiration string (e.g., "15m", "7d", "2h") to milliseconds
 */
function parseExpirationToMs(expiration: string): number {
  if (expiration.endsWith('d')) {
    const days = parseInt(expiration.replace('d', ''), 10);
    return days * 24 * 60 * 60 * 1000;
  } else if (expiration.endsWith('h')) {
    const hours = parseInt(expiration.replace('h', ''), 10);
    return hours * 60 * 60 * 1000;
  } else if (expiration.endsWith('m')) {
    const minutes = parseInt(expiration.replace('m', ''), 10);
    return minutes * 60 * 1000;
  } else if (expiration.endsWith('s')) {
    const seconds = parseInt(expiration.replace('s', ''), 10);
    return seconds * 1000;
  }
  // Default to 15 minutes if format is unknown
  return 15 * 60 * 1000;
}

