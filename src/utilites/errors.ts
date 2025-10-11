interface CustomErrorOptions {
  cause: string[];
}

export class ValidationError extends Error {
  cause: string[];
  status = 400;

  constructor(message: string, options?: CustomErrorOptions) {
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
  cause: string[];
  status = 404;

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);

    this.name = 'NotFoundError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}

export class BadRequestError extends Error {
  status = 400;
  cause: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);

    this.name = 'BadRequestError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}

export class InternalServerError extends Error {
  status = 500;
  cause: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);

    this.name = 'InternalServerError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}

export class ForbiddenError extends Error {
  status = 403;
  cause: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);

    this.name = 'ForbiddenError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  cause: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);

    this.name = 'UnauthorizedError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}
