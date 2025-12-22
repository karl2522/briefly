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
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OAuthExceptionFilter } from './filters/oauth-exception.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { clearAuthCookies, setAuthCookies } from './utils/cookie.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const authResponse = await this.authService.register(registerDto);
    // Set tokens in httpOnly cookies
    setAuthCookies(res, authResponse.accessToken, authResponse.refreshToken, this.configService);
    // Return user data only (tokens are in cookies)
    return res.json({
      success: true,
      data: {
        user: authResponse.user,
      },
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const authResponse = await this.authService.login(loginDto);
    // Set tokens in httpOnly cookies
    setAuthCookies(res, authResponse.accessToken, authResponse.refreshToken, this.configService);
    // Return user data only (tokens are in cookies)
    return res.json({
      success: true,
      data: {
        user: authResponse.user,
      },
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
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
    
    // Return user data only (tokens are in cookies)
    return res.json({
      success: true,
      data: {
        user: authResponse.user,
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
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    // Get mode from query parameter
    const mode = (req.query?.mode as string) || 'signin';
    if (mode !== 'signup' && mode !== 'signin') {
      // Invalid mode, default to signin
      return;
    }
    
    // Store mode in a cookie that will be available in the callback
    res.cookie('oauth_mode', mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // More secure than 'lax'
      maxAge: 5 * 60 * 1000, // 5 minutes
    });
    
    // Guard redirects to Google (this will happen automatically)
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @UseFilters(OAuthExceptionFilter)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const user = req.user as any;
    // Get mode from cookie (set before OAuth redirect)
    const mode = req.cookies?.oauth_mode as string;
    const isSignup = mode === 'signup';
    
    // Clear the cookie after use
    res.clearCookie('oauth_mode');

    if (!user || !user.id || !user.email) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'OAuth authentication failed. Please try again.');
      return res.redirect(errorUrl.toString());
    }

    try {
      const tokens = await this.authService.generateTokens(user.id, user.email);
      // Set tokens in httpOnly cookies instead of URL
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken, this.configService);
      // Redirect to callback page (tokens are in cookies, not URL)
      res.redirect(`${frontendUrl}/auth/callback?success=true`);
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
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    // Get mode from query parameter
    const mode = (req.query?.mode as string) || 'signin';
    if (mode !== 'signup' && mode !== 'signin') {
      // Invalid mode, default to signin
      return;
    }
    
    // Store mode in a cookie that will be available in the callback
    res.cookie('oauth_mode', mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // More secure than 'lax'
      maxAge: 5 * 60 * 1000, // 5 minutes
    });
    
    // Guard redirects to Facebook (this will happen automatically)
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @UseFilters(OAuthExceptionFilter)
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const user = req.user as any;
    // Get mode from cookie (set before OAuth redirect)
    const mode = req.cookies?.oauth_mode as string;
    const isSignup = mode === 'signup';
    
    // Clear the cookie after use
    res.clearCookie('oauth_mode');

    if (!user || !user.id || !user.email) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'OAuth authentication failed. Please try again.');
      return res.redirect(errorUrl.toString());
    }

    try {
      const tokens = await this.authService.generateTokens(user.id, user.email);
      // Set tokens in httpOnly cookies instead of URL
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken, this.configService);
      // Redirect to callback page (tokens are in cookies, not URL)
      res.redirect(`${frontendUrl}/auth/callback?success=true`);
    } catch (error) {
      const redirectPage = isSignup ? '/sign-up' : '/sign-in';
      const errorUrl = new URL(redirectPage, frontendUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', 'An error occurred during authentication.');
      res.redirect(errorUrl.toString());
    }
  }
}


