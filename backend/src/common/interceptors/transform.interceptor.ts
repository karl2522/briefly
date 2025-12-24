import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }
        // Otherwise, wrap it in ApiResponse
        return ApiResponse.success(data);
      }),
    );
  }
}








