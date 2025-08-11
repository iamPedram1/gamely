interface ValidationErrorOptions {
  cause: string[];
}

export class ValidationError extends Error {
  cause: string[];

  constructor(message: string, options?: ValidationErrorOptions) {
    super(message);
    this.name = 'ValidationError';
    this.cause = options?.cause || [];

    if (options?.cause && options.cause.length > 0) {
      this.message = options.cause[0];
    }

    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}

export class NotFoundError extends Error {
  constructor(message: string, options?: ValidationErrorOptions) {
    super(message);

    this.name = 'NotFoundError';
    this.cause = options;
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}
