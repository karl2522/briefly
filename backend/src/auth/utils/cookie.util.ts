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

  // Set access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: accessTokenMaxAge,
    path: '/',
  });

  // Set refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: refreshTokenMaxAge,
    path: '/',
  });
}

/**
 * Clears authentication cookies
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
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

