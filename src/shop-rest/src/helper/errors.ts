import { Response } from "express";
import { logger } from '../logger';

export const handleError = (e: unknown, res: Response) => {
    let message = "Server error";
    if (e instanceof BadRequestError) {
        logger.error(e.stack)
        return res.status(400).send(e.message)
    } else if (e instanceof UnauthorizedError) {
        logger.error(e.stack)
        return res.status(401).send(e.message)
    } else if (e instanceof NotFoundError) {
        logger.error(e.stack)
        return res.status(404).send(e.message)
    } else if (e instanceof UnprocessableEntityError) {
        logger.error(e.stack)
        return res.status(409).send(e.message)
    } else if (e instanceof Error) {
        logger.error(e.stack)
        message = e.message;
    }
    return res.status(500).send(message);
}

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