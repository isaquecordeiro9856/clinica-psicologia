import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as { message?: string | string[]; error?: string } | string;
    const details = typeof exceptionResponse === 'string' ? { message: exceptionResponse } : exceptionResponse;

    response.status(status).json({
      error: {
        statusCode: status,
        message: details?.message ?? exception.message,
        error: details?.error,
      },
    });
  }
}
