import type { Request, Response, NextFunction } from 'express';
import logger from 'utilites/logger';
import sendResponse from 'utilites/response';
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'utilites/errors';

/**
 * Global error-handling middleware for Express.
 *
 * Logs the error and sends a standardized `ApiResponse` object to the client.
 * Distinguishes between `ValidationError` (client error) and all other errors (server error).
 *
 * - ValidationError → HTTP 400 with detailed validation messages.
 * - Other errors → HTTP 500 with a generic internal server error message.
 *
 * @param error - The error object thrown from the route or middleware.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 *
 * @returns Sends a JSON `ApiResponse` to the client.
 */
export default function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    cause: error.cause,
  });

  const isNotFoundError = error instanceof NotFoundError;
  const isForbiddenError = error instanceof ForbiddenError;
  const isValidationError = error instanceof ValidationError;
  const isBadRequestError = error instanceof BadRequestError;
  const isInternalServerError = error instanceof InternalServerError;
  const isUnauthorizedError = error instanceof UnauthorizedError;
  const isHandledError =
    isNotFoundError ||
    isForbiddenError ||
    isValidationError ||
    isBadRequestError ||
    isInternalServerError ||
    isUnauthorizedError;

  console.log(
    isHandledError,
    error.status,
    error.cause,
    error.message,
    error.name
  );

  sendResponse(res, isHandledError ? error.status || 500 : 500, {
    body: {
      errors: isHandledError ? error.cause : ['Internal server error'],
      message: isHandledError ? error.message : 'Internal server error',
    },
  });
}
