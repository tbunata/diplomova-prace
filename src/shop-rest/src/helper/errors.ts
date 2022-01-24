import { Response } from "express";
import { logger } from '../logger';

export const handleError = (e: unknown, res: Response) => {
    logger.error(e);
    let message = "Server error";
    if (e instanceof Error) {
        message = e.message;
    }
    res.status(500).send(message);
};
