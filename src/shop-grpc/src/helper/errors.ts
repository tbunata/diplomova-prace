export class BadRequestError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnprocessableEntityError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}

export class InvalidArgumentError extends Error {
  constructor(msg: string) {
    super(msg);

    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}
