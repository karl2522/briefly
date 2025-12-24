import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isProduction: boolean;

  constructor() {
    // Get production status from environment
    // Note: ConfigService injection in filters can be complex, using env directly
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Sanitizes error messages in production to prevent information disclosure
   */
  private sanitizeErrorMessage(message: string, status: number): string {
    if (!this.isProduction) {
      return message; // Return full message in development
    }

    // In production, sanitize error messages to prevent information disclosure
    // Don't expose internal errors, stack traces, or system details
    
    // Generic messages for common error types
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'An internal error occurred. Please try again later.';
    }
    
    if (status === HttpStatus.UNAUTHORIZED) {
      // Don't reveal whether email exists or not
      if (message.toLowerCase().includes('email') || message.toLowerCase().includes('password')) {
        return 'Invalid credentials. Please check your email and password.';
      }
      return 'Authentication required. Please sign in.';
    }
    
    if (status === HttpStatus.FORBIDDEN) {
      return 'You do not have permission to perform this action.';
    }
    
    if (status === HttpStatus.NOT_FOUND) {
      return 'The requested resource was not found.';
    }
    
    // For validation errors, return the message as-is (already user-friendly)
    if (status === HttpStatus.BAD_REQUEST) {
      return message;
    }
    
    // For other errors, return generic message
    return 'An error occurred. Please try again.';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | object = 'Internal Server Error';
    let internalMessage = ''; // For logging purposes

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        internalMessage = exceptionResponse;
        message = this.sanitizeErrorMessage(exceptionResponse, status);
        error = message;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors (BadRequestException from ValidationPipe)
        // ValidationPipe returns errors as an array in responseObj.message
        if (Array.isArray(responseObj.message)) {
          // Format validation errors into a user-friendly message
          const validationErrors = responseObj.message as string[];
          // Filter out any undefined/null values and join with spaces
          const cleanErrors = validationErrors.filter(err => err).join(' ');
          internalMessage = cleanErrors || 'Validation error';
          message = cleanErrors || 'Please check your input and try again.';
          error = message;
        } else if (responseObj.message && typeof responseObj.message === 'object' && !Array.isArray(responseObj.message)) {
          // Sometimes validation errors might be nested in an object
          // Try to extract messages from nested structure
          const nestedMessages = Object.values(responseObj.message).flat().filter((msg: any) => typeof msg === 'string');
          if (nestedMessages.length > 0) {
            message = nestedMessages.join(' ');
            error = message;
          } else {
            // Fall through to normal extraction
          }
        } else {
          // Extract message from response object
          // For UnauthorizedException and other HttpExceptions, the message is in responseObj.message
          // Priority: responseObj.message > responseObj.error > exception.message (but avoid generic defaults)
          const extractedMessage = responseObj.message || responseObj.error;
          
          // Only use exception.message if it's not a generic default
          const exceptionMsg = exception.message;
          const isGenericMessage = exceptionMsg === 'Unauthorized' || 
                                   exceptionMsg === 'Forbidden' ||
                                   exceptionMsg === 'Bad Request' ||
                                   exceptionMsg === 'Not Found' ||
                                   exceptionMsg === 'Internal Server Error';
          
          if (extractedMessage && extractedMessage !== 'Bad Request') {
            internalMessage = extractedMessage;
            message = this.sanitizeErrorMessage(extractedMessage, status);
            error = message;
          } else if (!isGenericMessage) {
            internalMessage = exceptionMsg;
            message = this.sanitizeErrorMessage(exceptionMsg, status);
            error = message;
          } else {
            // For generic messages, provide a more helpful default
            internalMessage = exceptionMsg;
            if (status === HttpStatus.BAD_REQUEST) {
              message = 'Please check your input and try again.';
              error = message;
            } else {
              message = this.sanitizeErrorMessage('An error occurred', status);
              error = message;
            }
          }
        }
      }
    } else if (exception instanceof Error) {
      internalMessage = exception.message;
      message = this.sanitizeErrorMessage(exception.message, status);
      error = message;
    }

    const errorResponse: ApiResponse<null> = ApiResponse.error(
      typeof error === 'string' ? error : JSON.stringify(error),
      message,
    );

    // Log full error details (including stack trace) but don't expose to client
    const logMessage = internalMessage || message;
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${logMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}





