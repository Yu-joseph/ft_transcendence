import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
 * 
 * @description for JWT auth
 */

export const authenticated = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.access_token;
    if (!token)
        return res.status(401).json({ message: 'Authorisation header missing' });
    try {
        console.log(process.env.SECRET_KEY);
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
        if(typeof decoded === 'string' || decoded === null)
            return res.status(401).json({message: 'Invalid token payload'});
        req.user = decoded;
        console.log("Payload:", req.user);
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid Token' });
    }
}


