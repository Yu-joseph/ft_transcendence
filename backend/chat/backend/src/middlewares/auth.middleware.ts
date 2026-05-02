import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export interface JwtPayload {
   token_type: unknown,
   exp: number,
   iat: number,
   jti: string,
   user_id: string
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload
}

//******************************************* */
/**
 * @description for JWT auth
 */

export const authenticated = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
        const token = req.cookies.access_token;
        if (!token)
            return res.status(401).json({ message: 'Authorisation header missing' });
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
            if(typeof decoded === 'string' || decoded === null)
                return res.status(401).json({message: 'Invalid token payload'});
            
            // Verify user actually exists
            const userExists = await prisma.user.findUnique({
                where: { id: decoded.user_id }
            });
            if (!userExists) {
                return res.status(401).json({ message: 'User not found in database' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid Token' });
        }
}


