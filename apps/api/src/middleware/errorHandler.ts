import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../errors/AppError.js';

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  stack?: string;
}

export const errorHandler = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle Fastify validation errors
  if (error.name === 'FastifyError' && (error as any).statusCode === 400) {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  }
  // Handle known application errors
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // Handle Prisma errors
  else if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this information already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
    isOperational = true;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }
  // Handle validation errors (Zod, etc.)
  else if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    isOperational = true;
  }
  // Handle Fastify schema validation errors
  else if (error.message && error.message.includes('must be')) {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  }
  // Handle other validation-like errors
  else if (error.message && (
    error.message.includes('must have required property') ||
    error.message.includes('must NOT have fewer than') ||
    error.message.includes('must be equal to one of the allowed values') ||
    error.message.includes('must be string') ||
    error.message.includes('must be integer') ||
    error.message.includes('must be boolean')
  )) {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  }

  // Log error for debugging (only log unexpected errors in production)
  if (!isOperational || process.env.NODE_ENV !== 'production') {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.url,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Send error response
  reply.status(statusCode).send(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (request: FastifyRequest, reply: FastifyReply, done?: Function) => {
    Promise.resolve(fn(request, reply, done)).catch((error) => {
      if (done) {
        done(error);
      } else {
        errorHandler(error, request, reply);
      }
    });
  };
};
