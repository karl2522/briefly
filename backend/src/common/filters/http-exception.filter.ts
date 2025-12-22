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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | object = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors (BadRequestException from ValidationPipe)
        // ValidationPipe returns errors as an array in responseObj.message
        if (Array.isArray(responseObj.message)) {
          // Format validation errors into a user-friendly message
          const validationErrors = responseObj.message as string[];
          // Filter out any undefined/null values and join with spaces
          const cleanErrors = validationErrors.filter(err => err).join(' ');
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
            message = extractedMessage;
            error = extractedMessage;
          } else if (!isGenericMessage) {
            message = exceptionMsg;
            error = exceptionMsg;
          } else {
            // For generic messages, provide a more helpful default
            if (status === HttpStatus.BAD_REQUEST) {
              message = 'Please check your input and try again.';
              error = message;
            } else {
              message = 'An error occurred. Please try again.';
              error = message;
            }
          }
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.message;
    }

    const errorResponse: ApiResponse<null> = ApiResponse.error(
      typeof error === 'string' ? error : JSON.stringify(error),
      message,
    );

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}



