import { t } from 'core/utilites/request-context';

interface CustomErrorOptions {
  cause: string[];
  errorDetails?: Record<string, any>;
}

export class ValidationError extends Error {
  cause: string[];
  status = 400;
  errorDetails = {};

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);
    this.name = 'ValidationError';
    this.cause = options?.cause || [];
    this.errorDetails = options?.errorDetails || {};

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

export class AnonymousError extends Error {
  cause: string[];
  status = 400;
  mask: string;

  constructor(
    message: string,
    mask: string = 'Internal server error',
    status: number = 400,
    options?: CustomErrorOptions
  ) {
    super(message);

    this.name = 'AnonymousError';
    this.mask = mask;
    this.status = status;
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ValidationError);
  }
}

export class BadRequestError extends Error {
  status = 400;
  cause: string[];

  constructor(message?: string, options?: CustomErrorOptions) {
    super(message || t('error.bad_request'));

    this.name = 'BadRequestError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, BadRequestError);
  }
}

export class InternalServerError extends Error {
  status = 500;
  cause: string[];

  constructor(message?: string, options?: CustomErrorOptions) {
    super(message || t('common.internal_server_error'));

    this.name = 'InternalServerError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, InternalServerError);
  }
}

export class ForbiddenError extends Error {
  status = 403;
  cause: string[];

  constructor(message?: string, options?: CustomErrorOptions) {
    super(message || t('error.forbidden_error'));

    this.name = 'ForbiddenError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace) Error.captureStackTrace(this, ForbiddenError);
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  cause: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message || t('error.unauthorized_error'));

    this.name = 'UnauthorizedError';
    this.cause = options?.cause || [];
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, UnauthorizedError);
  }
}
