import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
        role: string;
    };
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        // token from header 
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({ error: 'No token provided'});
        }

        const token = authHeader.substring(7);
        // token verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            email: string;
            role: string;
        };
        
        (req as AuthRequest).user = decoded;

        next();
    } catch(error){
        return res.status(401).json({error: 'Invalid or expired token'});
    }
};

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = (req as AuthRequest).user;

    if(!user || user.role != 'admin'){
        return res.status(403).json({ error: 'Admin access required'});
    }
    next();
};