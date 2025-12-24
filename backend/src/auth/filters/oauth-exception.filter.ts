import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    Logger
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Only handle OAuth callback routes
    const isOAuthCallback = request.url.includes('/auth/google/callback') ||
                           request.url.includes('/auth/facebook/callback');

    if (!isOAuthCallback) {
      // Not an OAuth route, let the global filter handle it
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let errorMessage = 'oauth_failed';

    // Extract error message
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        errorMessage = responseObj.message || exception.message;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    // Map error messages to error codes
    let errorCode = 'oauth_failed';
    if (errorMessage.includes('No account found') || 
        errorMessage.includes('Account not found') || 
        errorMessage.includes('sign up')) {
      errorCode = 'account_not_found';
    } else if (errorMessage.includes('email/password')) {
      errorCode = 'wrong_auth_method';
    } else if (errorMessage.includes('OAuth') || errorMessage.includes('Google') || errorMessage.includes('Facebook')) {
      errorCode = 'wrong_auth_method';
    }

    this.logger.error(
      `OAuth callback failed: ${request.url} - ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Determine redirect page based on cookie or default to sign-in
    const mode = request.cookies?.oauth_mode as string;
    const isSignup = mode === 'signup';
    const redirectPage = isSignup ? '/sign-up' : '/sign-in';
    
    // Redirect to appropriate page with error
    const errorUrl = new URL(redirectPage, frontendUrl);
    errorUrl.searchParams.set('error', errorCode);
    errorUrl.searchParams.set('message', errorMessage); // Pass the actual error message
    
    response.redirect(errorUrl.toString());
  }
}






