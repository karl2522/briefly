import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { safeLog } from '../../common/utils/logger.util';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

// Custom extractor to get JWT from cookie or Authorization header (for backward compatibility)
const cookieExtractor = (req: Request): string | null => {
  // Debug logging for cookie issues
  if (req && req.cookies) {
    safeLog.log('[JWT Strategy] Cookies received:', Object.keys(req.cookies));
    safeLog.log('[JWT Strategy] accessToken cookie exists:', !!req.cookies['accessToken']);
  } else {
    safeLog.log('[JWT Strategy] No cookies object in request');
  }
  
  if (req && req.cookies && req.cookies['accessToken']) {
    safeLog.log('[JWT Strategy] Using accessToken from cookie');
    return req.cookies['accessToken'];
  }
  // Fallback to Authorization header if cookie not found
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      safeLog.log('[JWT Strategy] Using token from Authorization header');
      return authHeader.substring(7);
    }
  }
  safeLog.log('[JWT Strategy] No token found in cookies or Authorization header');
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('app.jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}






