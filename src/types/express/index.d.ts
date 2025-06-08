import { UserInstance } from '../../models/User';
import { Request, Response, NextFunction, RequestHandler } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: UserInstance;
        }
    }
}

export interface TypedRequestHandler<P = any> extends RequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void> | void;
}

export interface TypedAuthRequestHandler<P = any> extends RequestHandler {
    (req: Request & { user: UserInstance }, res: Response, next: NextFunction): Promise<void> | void;
}

export interface AuthRequest extends Request {
    user: UserInstance;
} 