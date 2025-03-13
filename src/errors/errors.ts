export const ERROR_CODES = {
    BAD_REQUEST: 'BAD_REQUEST',
    COULD_NOT_CREATE: 'COULD NOT CREATE',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    COULD_NOT_UPDATE: 'COULD NOT UPDATE',
    COULD_NOT_GET_REPORT: 'COULD NOT GET REPORT',
  };
  
  export class BadRequestError extends Error {
    code: string;
    error: string;
    constructor(code: string, message: string | undefined) {
      super(message);
      this.code = code;
      this.error = code;
    }
  }
  
  export class CouldNotCreate extends Error {
    code: string;
    error: string;
    constructor(code: string, message: string | undefined) {
      super(message);
      this.code = code;
      this.error = code;
    }
  }
  
  export class InternalServerError extends Error {
    code: string;
    error: string;
    constructor(code: string, message: string | undefined) {
      super(message);
      this.code = code;
      this.error = code;
    }
  }
  
  export class CouldNotUpdate extends Error {
    code: string;
    error: string;
    constructor(code: string, message: string | undefined) {
      super(message);
      this.code = code;
      this.error = code;
    }
  };

  export class CouldNotGetReport extends Error {
    code: string;
    error: string;
    constructor(code: string, message: string | undefined) {
      super(message);
      this.code = code;
      this.error = code;
    }
  }
  