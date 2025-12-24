import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { sanitizeEmail } from '../common/utils/sanitize.util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
import { JwtPayload } from './strategies/jwt.strategy';
import { PasswordUtil } from './utils/password.util';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name } = registerDto;

    // Sanitize inputs
    const { sanitizeEmail, sanitizeName } = require('../common/utils/sanitize.util');
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedName = sanitizeName(name);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists. Please sign in instead or use a different email address.');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: sanitizedName || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('No account found with this email address. Please check your email or sign up to create an account.');
    }

    // Check if user signed up with OAuth (no password)
    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created with OAuth. Please sign in with OAuth.',
      );
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password. Please check your password and try again.');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('app.jwt.refreshSecret'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: payload.tokenId },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(
        tokenRecord.user.id,
        tokenRecord.user.email,
      );

      return {
        ...tokens,
        user: {
          id: tokenRecord.user.id,
          email: tokenRecord.user.email,
          name: tokenRecord.user.name,
          avatar: tokenRecord.user.avatar,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, tokenId?: string): Promise<void> {
    if (tokenId) {
      // Delete specific refresh token
      await this.prisma.refreshToken.deleteMany({
        where: {
          id: tokenId,
          userId,
        },
      });
    } else {
      // Delete all refresh tokens for user
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  async generateTokens(userId: string, email: string) {
    const jwtSecret = this.configService.get<string>('app.jwt.secret');
    const jwtExpiresIn = this.configService.get<string>('app.jwt.expiresIn') || '15m';
    const refreshSecret = this.configService.get<string>('app.jwt.refreshSecret');
    const refreshTokenExpiresIn = this.configService.get<string>('app.jwt.refreshExpiresIn') || '7d';

    if (!jwtSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn as any,
    });

    const expiresAt = new Date();
    
    // Parse refresh token expiration (e.g., "7d" -> 7 days, "15m" -> 15 minutes)
    if (refreshTokenExpiresIn.endsWith('d')) {
      const days = parseInt(refreshTokenExpiresIn.replace('d', ''), 10);
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (refreshTokenExpiresIn.endsWith('m')) {
      const minutes = parseInt(refreshTokenExpiresIn.replace('m', ''), 10);
      expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    } else if (refreshTokenExpiresIn.endsWith('h')) {
      const hours = parseInt(refreshTokenExpiresIn.replace('h', ''), 10);
      expiresAt.setHours(expiresAt.getHours() + hours);
    }

    // Generate a random token string for the refresh token record
    const tokenString = this.generateRandomToken();

    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId,
        token: tokenString,
        expiresAt,
      },
    });

    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      tokenId: refreshTokenRecord.id,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshTokenExpiresIn as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}




