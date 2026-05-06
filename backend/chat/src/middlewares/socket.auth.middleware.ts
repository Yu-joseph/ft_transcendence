import { Socket } from "socket.io";
import cookie from 'cookie';
import { AppError } from "../utils/AppError.js";
import  jwt   from    'jsonwebtoken'
import { JWT_SECRET, JwtPayload } from "./auth.middleware.js";
import prisma from "../lib/prisma.js";

export const socketAuthenticate = async (socket: Socket, next: (err?: Error) => void) => {
    try {
        const   rawCookie = socket.handshake.headers.cookie ?? '';
        const   cookies = cookie.parse(rawCookie);
        const   token = cookies['access_token'];

        if(!token)
            return next(new AppError('Authentication error: no cookie', 401));
        const   payload = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
<<<<<<< HEAD:backend/chat/backend/src/middlewares/socket.auth.middleware.ts
        console.log(payload);
        console.log(JWT_SECRET);

        if(typeof payload === 'string' || payload === null)
            return next(new AppError('Invalid token payload', 401));
            
        // Verify user actually exists in the database
=======
        if(typeof payload === 'string' || payload === null)
            return next(new AppError('Invalid token payload', 401));

>>>>>>> 1893babdcdb759c06251eeca73adc603da066f95:backend/chat/src/middlewares/socket.auth.middleware.ts
        const userExists = await prisma.user.findUnique({
            where: { id: payload.user_id }
        });
        if (!userExists) {
            return next(new AppError('User not found in database', 401));
        }

        (socket as any).user = payload;
        next();
    } catch (error) {
        return next(new AppError(error instanceof Error ? error.message : 'Authentication error', 401));
    }
}