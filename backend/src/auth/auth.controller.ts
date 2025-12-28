import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OAuthExceptionFilter } from './filters/oauth-exception.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RedisAuthService } from './services/redis-auth.service';
import { clearAuthCookies, setAuthCookies } from './utils/cookie.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisAuthService: RedisAuthService,
    private readonly configService: ConfigService,
  ) { }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const authResponse = await this.authService.register(registerDto);

    // OAuth 2.0 Authorization Code Flow:
    // Create temporary auth code instead of setting cookies directly
    // This fixes iOS Safari cookie blocking issues
    const authCode = await this.redisAuthService.createAuthCode(authResponse.user.id);

    // Return auth code (NOT tokens)
    // Frontend will exchange this code for tokens via /auth/exchange-code
    return res.json({
      success: true,
      data: {
        code: authCode,
        user: authResponse.user,
      },
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const authResponse = await this.authService.login(loginDto);

    // OAuth 2.0 Authorization Code Flow:
    // Create temporary auth code instead of setting cookies directly
    // This fixes iOS Safari cookie blocking issues
    const authCode = await this.redisAuthService.createAuthCode(authResponse.user.id);

    // Return auth code (NOT tokens)
    // Frontend will exchange this code for tokens via /auth/exchange-code
    return res.json({
      success: true,
      data: {
        code: authCode,
        user: authResponse.user,
      },
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute (iOS can trigger multiple refreshes)
  async refresh(@Req() req: Request, @Res() res: Response) {
    // Get refresh token from cookie (preferred) or body (fallback for backward compatibility)
    const refreshToken = req.cookies?.refreshToken || (req.body as any)?.refreshToken;

    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Refresh token (this validates, deletes old token, and generates new ones)
    const authResponse = await this.authService.refreshToken(refreshToken);

    // Set new tokens in httpOnly cookies
    setAuthCookies(res, authResponse.accessToken, authResponse.refreshToken, this.configService);

    // Return user data AND tokens (for Hybrid Storage on iOS)
    return res.json({
      success: true,
      data: {
        user: authResponse.user,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      },
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any, @Res() res: Response) {
    await this.authService.logout(user.id);
    // Clear auth cookies
    clearAuthCookies(res);
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  // Google OAuth - Single endpoint that handles both signup and signin
  @Public()
  @Get('google')
  @UseGuards(ThrottlerGuard, AuthGuard('google'))
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    // Mode is passed via OAuth state parameter (not cookies, which iOS Safari blocks)
    // The AuthGuard will handle the redirect to Google
    // Guard redirects to Google (this will happen automatically)
  }

  @Public()
  @Get('google/callback')
  @UseGuards(ThrottlerGuard, AuthGuard('google'))
  @UseFilters(OAuthExceptionFilter)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const user = req.user as any;
    // Get mode from query parameter (passed via OAuth state)
    const mode = req.query?.mode as string;
    const isSignup = mode === 'signup';


    if (!user || !user.id || !user.email) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'OAuth authentication failed. Please try again.');
      return res.redirect(errorUrl.toString());
    }

    try {
      // OAuth 2.0 Authorization Code Flow:
      // Create temporary auth code instead of setting cookies directly
      // This fixes iOS Safari cookie blocking issues
      const authCode = await this.redisAuthService.createAuthCode(user.id);

      // Redirect with auth code (NOT tokens)
      // Frontend will exchange this code for tokens via /auth/exchange-code
      res.redirect(`${frontendUrl}/auth/callback?code=${authCode}`);
    } catch (error) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'An error occurred during authentication.');
      res.redirect(errorUrl.toString());
    }
  }

  // Facebook OAuth - Single endpoint that handles both signup and signin
  @Public()
  @Get('facebook')
  @UseGuards(ThrottlerGuard, AuthGuard('facebook'))
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    // Mode is passed via OAuth state parameter (not cookies, which iOS Safari blocks)
    // The AuthGuard will handle the redirect to Facebook
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(ThrottlerGuard, AuthGuard('facebook'))
  @UseFilters(OAuthExceptionFilter)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const user = req.user as any;
    // Get mode from query parameter (passed via OAuth state)
    const mode = req.query?.mode as string;
    const isSignup = mode === 'signup';

    if (!user || !user.id || !user.email) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'OAuth authentication failed. Please try again.');
      return res.redirect(errorUrl.toString());
    }

    try {
      // OAuth 2.0 Authorization Code Flow:
      // Create temporary auth code instead of setting cookies directly
      // This fixes iOS Safari cookie blocking issues
      const authCode = await this.redisAuthService.createAuthCode(user.id);

      // Redirect with auth code (NOT tokens)
      // Frontend will exchange this code for tokens via /auth/exchange-code
      res.redirect(`${frontendUrl}/auth/callback?code=${authCode}`);
    } catch (error) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'An error occurred during authentication.');
      res.redirect(errorUrl.toString());
    }
  }
  /**
   * OAuth 2.0 Authorization Code Exchange Endpoint
   * Exchanges temporary auth code for access/refresh tokens
   * Tokens are set as httpOnly cookies (works on iOS)
   */
  @Public()
  @Post('exchange-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async exchangeCode(@Body() dto: ExchangeCodeDto, @Res() res: Response) {
    // Exchange auth code for userId
    const userId = await this.redisAuthService.exchangeAuthCode(dto.code);

    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid or expired authorization code',
      });
    }

    // Get user from database
    const user = await this.authService['prisma'].user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate tokens
    const tokens = await this.authService.generateTokens(user.id, user.email);

    // Set tokens in httpOnly cookies (same-domain context, works on iOS)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, this.configService);

    // Return success with tokens (for Hybrid Storage on iOS)
    // The frontend will save these to localStorage as a fallback if cookies fail
    return res.json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }
}







