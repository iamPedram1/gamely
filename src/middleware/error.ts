import type { Request, Response, NextFunction } from 'express';
import logger from 'utilites/logger';
import ApiResponse from 'utilites/response';
import { NotFoundError, ValidationError } from 'utilites/errors';

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
  logger.error(error.name, error);

  const isValidationError = error instanceof ValidationError;
  const isNotFoundError = error instanceof NotFoundError;

  const status = isValidationError ? 400 : isNotFoundError ? 404 : 500;

  const response = new ApiResponse(
    { status },
    {
      errors: isValidationError ? (error.cause as string[]) : [],
      message:
        isValidationError || isNotFoundError
          ? error.message
          : 'Internal server error',
    }
  );

  res.status(status).json(response);
}
