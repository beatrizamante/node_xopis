export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  COULD_NOT_CREATE: 'COULD NOT CREATE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  COULD_NOT_UPDATE: 'COULD NOT UPDATE',
};

export class BaseError extends Error {
  code: string;
  error: string;
  constructor(code: string, message: string | undefined) {
    super(message);
    this.code = code;
    this.error = code;
  }
}

export class CouldNotCreateError extends BaseError {}

export class InternalServerError extends BaseError {}

export class CouldNotUpdateError extends BaseError {}
