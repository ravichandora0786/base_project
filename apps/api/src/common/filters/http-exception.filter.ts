import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logErrorToFile } from '../utils/logger.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || exception.message;
        errors = exceptionResponse.errors || (exceptionResponse.message ? [exceptionResponse.message] : []);
      } else {
        message = exceptionResponse || exception.message;
      }
    } else {
      // For unhandled system exceptions (e.g. database connection or syntax error)
      message = exception.message || 'Something went wrong';
      errors = [exception.message || 'Internal server error'];
    }

    // Log the error to file using our file logger utility
    logErrorToFile({
      error: exception,
      context: 'GlobalExceptionFilter',
      request,
      status,
    });

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
