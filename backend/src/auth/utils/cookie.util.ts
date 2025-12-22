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

  // Extract domain from frontend URL for cookie domain setting
  const frontendUrl = configService.get<string>('app.frontendUrl') || '';
  let cookieDomain: string | undefined;
  
  if (isProduction && frontendUrl) {
    try {
      const url = new URL(frontendUrl);
      // Set domain for production (e.g., '.yourdomain.com' for subdomain support)
      // Only set if it's a proper domain (not localhost or IP)
      if (url.hostname && !url.hostname.includes('localhost') && !url.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        // Extract root domain (e.g., 'yourdomain.com' from 'app.yourdomain.com')
        const parts = url.hostname.split('.');
        if (parts.length >= 2) {
          cookieDomain = `.${parts.slice(-2).join('.')}`;
        }
      }
    } catch (e) {
      // Invalid URL, skip domain setting
    }
  }

  // Set access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: accessTokenMaxAge,
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }), // Set domain only in production with valid domain
  });

  // Set refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: refreshTokenMaxAge,
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }), // Set domain only in production with valid domain
  });
}

/**
 * Clears authentication cookies
 */
export function clearAuthCookies(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || '';
  let cookieDomain: string | undefined;
  
  if (isProduction && frontendUrl) {
    try {
      const url = new URL(frontendUrl);
      if (url.hostname && !url.hostname.includes('localhost') && !url.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        const parts = url.hostname.split('.');
        if (parts.length >= 2) {
          cookieDomain = `.${parts.slice(-2).join('.')}`;
        }
      }
    } catch (e) {
      // Invalid URL, skip domain setting
    }
  }

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
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

