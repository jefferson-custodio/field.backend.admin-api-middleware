import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // next.handle() is an Observable of the controller's result value
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof EntityNotFoundError) {
          throw new NotFoundException(error.message);
        } else if (
          error instanceof QueryFailedError ||
          error instanceof BadRequestException
        ) {
          error = error as any;
          if (
            /^duplicate key value violates unique constraint/.test(
              error.message,
            )
          ) {
            throw new BadRequestException(
              error.response?.error || error.message,
            );
          } else if (/violates foreign key constraint/.test(error.message)) {
            throw new BadRequestException(
              error.response?.error || error.message,
            );
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }),
    );
  }
}
