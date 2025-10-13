import { MulterError } from 'multer';

// Utilities
import logger from 'utilites/logger';
import sendResponse from 'utilites/response';
import {
  AnonymousError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'utilites/errors';

// Types
import type { Request, Response, NextFunction } from 'express';

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
  const isMulterError = error instanceof MulterError;
  const isValidationError = error instanceof ValidationError;
  const isBadRequestError = error instanceof BadRequestError;
  const isInternalServerError = error instanceof InternalServerError; // We Dont Want to return error message to client.
  const isAnonymousError = error instanceof AnonymousError;
  const isUnauthorizedError = error instanceof UnauthorizedError;
  const isHandledError =
    isNotFoundError ||
    isForbiddenError ||
    isValidationError ||
    isInternalServerError ||
    isBadRequestError ||
    isUnauthorizedError;

  let status = 500;
  let message = 'Internal server error';
  let errors = ['Internal server error'];

  if (isHandledError) {
    status = error.status;
    message = error.message;
    errors = error.cause;
  } else if (isMulterError) {
    status = 400;
    message = error.message;
    errors = [error.message];
  } else if (isAnonymousError) {
    status = error.status;
    message = error.mask;
    errors = [error.mask];
  }

  sendResponse(res, status, {
    body: {
      message,
      errors,
    },
  });
}
