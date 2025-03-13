export const ERROR_CODES = {
    BAD_REQUEST: 'BAD_REQUEST',
    COULD_NOT_CREATE: 'COULD NOT CREATE',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    COULD_NOT_UPDATE: 'COULD NOT UPDATE',
    COULD_NOT_GET_REPORT: 'COULD NOT GET REPORT',
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

export class CouldNotCreate extends BaseError {}

export class InternalServerError extends BaseError {}

export class CouldNotUpdate extends BaseError {}

export class CouldNotGetReport extends BaseError {}

