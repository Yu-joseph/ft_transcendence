import  { Request, Response, NextFunction } from    'express';
import  jwt                                 from    'jsonwebtoken';

interface   JwtPayload {
    id: number,
    username?: string
}

export interface   AuthenticatedRequest extends Request {
    user?: JwtPayload
}


export  const   authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {

    const   authHeader = req.headers.authorization;
    if(!authHeader)
        return res.status(401).json({message: 'Authorisation header missing'});
    const   token = authHeader.split(" ")[1];
    if(!token)
        return res.status(401).json({message: 'Token missing'});
    try {
        console.log(process.env.SECRET_KEY);
        const   decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
        req.user = decoded;
        console.log("Payload:", req.user);
        next();
    } catch (error) {
        res.status(401).json({message: 'Invalid Token'});
    }
}

