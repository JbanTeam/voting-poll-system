import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { httpStatusMap } from 'src/utils/constants';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : { error: 'Internal server error' };

    let errorMessage: string;
    let errorString: string;

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const { message, error } = errorResponse as { message: string | string[]; error: string };
      errorMessage = Array.isArray(message) ? message.join(', ') : message;
      errorString = error || String(httpStatusMap.get(status));
    } else {
      errorMessage = String(errorResponse);
      errorString = String(httpStatusMap.get(status));
    }

    // TODO: add logging
    console.log(exception);

    this.logger.error(`HTTP ${status} Error: ${request.method} ${request.url} - ${String(exception)}`);

    response.status(status).json({
      message: errorMessage,
      error: errorString,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
