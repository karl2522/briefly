import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtRefreshPayload {
  sub: string; // user id
  tokenId: string; // refresh token id
}

// Custom extractor to get refresh token from cookie or body (for backward compatibility)
const refreshTokenExtractor = (req: Request): string | null => {
  if (req && req.cookies && req.cookies['refreshToken']) {
    return req.cookies['refreshToken'];
  }
  // Fallback to body if cookie not found
  if (req.body && req.body.refreshToken) {
    return req.body.refreshToken;
  }
  return null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const refreshSecret = configService.get<string>('app.jwt.refreshSecret');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshTokenExtractor]),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      userId: payload.sub,
      tokenId: payload.tokenId,
      user: refreshToken.user,
    };
  }
}







