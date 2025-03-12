export class BaseError extends Error {
  code: string;
  error: string;
  constructor(code: string, message: string | undefined) {
    super(message);
    this.code = code;
    this.error = code;
  }
}

export class BadRequestError extends BaseError {}