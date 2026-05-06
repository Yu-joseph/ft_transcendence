import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { socketAuthenticate } from '../middlewares/socket.auth.middleware.js';
import { JoinChatInf } from './socket.types.js';
import prisma from '../lib/prisma.js';
import z from 'zod';
import { FriendService } from '../modules/friend/friend.service.js';
import { JwtPayload } from '../middlewares/auth.middleware.js';
import { corsOrigins } from '../app.js';

let io: Server;

const   emitError = (socket: Socket, message: string) => {
    socket.emit('error' ,{message});
}

const joinChatSchema = z.object({
    room_id: z.string().min(1, 'Invalid room id')
                        .transform((val: string) => val.trim()),
    /******************** */
    convId: z.string().regex(/^\d+$/, 'Invalid conversation ID')
                          .transform((val: string) => val.trim()),
    /******************* */
    userId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform((val: string) => val.trim())
})

const roomIdSchema = z.string().min(1).transform((val: string) => val.trim());
/** User Othorization helper function */
const   isUserInConversation = async (convId: string, userId: string) => {
    return await prisma.conversation.findFirst({
        where: {
            id: BigInt(convId),
            OR: [{ user1Id: userId }, { user2Id: userId }]
        }
    });
}

/**************** */

export const initSocket = (server: HTTPServer) => {

    io = new Server(server, {
        cors: {
<<<<<<< HEAD:backend/chat/backend/src/socket/index.ts
                origin: [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:5173",
    "https://localhost:8443",
    "https://10.30.234.188:8443",
    "https://10.30.242.27:8443"


  ],
  
            credentials: true
=======
                origin: corsOrigins,
                credentials: true,
                optionsSuccessStatus: 200
>>>>>>> 1893babdcdb759c06251eeca73adc603da066f95:backend/chat/src/socket/index.ts
        }
    })
    console.log("[🔌] Socket.IO engine initialized on HTTP server...");

    io.use(socketAuthenticate);
    io.on('connection', async (socket: any) => {
        const   authentUser = (socket as any).user as JwtPayload;
        const userConversationCache = new Set<string>(); // stores convId as string
        /** Update status to Online when connecting  */
        try {
            await prisma.user.update({
                where: { id: authentUser.user_id },
                data: { user_status: 'Online' }
            });
            // Notify friends that this user is now Online
            const friends = await FriendService.getFriendIds(authentUser.user_id);
            friends.forEach(fId => io.to(fId).emit('status:update', { userId: authentUser.user_id, status: 'Online' }));
        } catch (e: any) {
            console.error('Failed to update status to Online:', e);
        }
        /*************************************************** */
        socket.join(authentUser.user_id); // for conversation Update and notification , so i emit the event for the sender and receiver

        /**
         * ****  join chat handler ****
         **/
        const   onJoinChannel = async (data: JoinChatInf) => {
            const validatedData = joinChatSchema.safeParse(data);

            if(!validatedData.success || validatedData.data.userId !== authentUser.user_id){
                emitError(socket, 'Invalid request data');
                return ;
            }
            const  {room_id, convId, userId} = validatedData.data;

            if(await isUserInConversation(convId, userId)) {
                socket.join(room_id);
                userConversationCache.add(convId); // i cach it here
            }
        }
        /**
        * ****  typing start handler ****
        **/
        const   typingSchema = z.object({
            friendId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform((val: string) => val.trim()),
            userId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform((val: string) => val.trim()),
            convId: z.string().regex(/^\d+$/, 'Invalid conversation ID')
                          .transform((val: string) => val.trim())
        });

        const   onTypingStart = async (data: unknown) => {
            const   validatedData = typingSchema.safeParse(data);
            if(!validatedData.success || validatedData.data.userId !== authentUser.user_id) {
                emitError(socket, 'Invalid request data');
                return ;
            }
            const   {friendId, convId} = validatedData.data;
            if (userConversationCache.has(convId)) {
                socket.to(friendId).emit('typing:start', {convId});
            }
        }
        /**
        * ****  typing stop handler ****
        **/
        const onTypingStop = async (data: unknown) => {
            const validated = typingSchema.safeParse(data);
            if (!validated.success || validated.data.userId !== authentUser.user_id) {
                emitError(socket, 'Invalid request data');
                return;
            }
            const   {friendId, convId} = validated.data;
            if(userConversationCache.has(convId)) {
                socket.to(friendId).emit('typing:stop', {convId});
            }
        };
        /**
        * ****  leave conversation handler ****
        **/
        socket.on('leave:conversation', (room_id: unknown) => {
            const validated = roomIdSchema.safeParse(room_id);
            if (!validated.success) {
                emitError(socket, 'Invalid request data');
                return;
            }
            socket.leave(validated.data);
            const   convId = validated.data.replace('ROOM_', '');
            userConversationCache.delete(convId);
        });

        socket.on('typing:stop', onTypingStop);
        socket.on('disconnect', async () => {
        /** Update status to Offline when user disconnect */
            try {
                //i check first if that user loged in multipl tabs or device, if yes i don't set to Offline
                const   connectedSockets = await io.in(authentUser.user_id).fetchSockets();
                if(connectedSockets.length === 0) {
                    await prisma.user.update({
                        where: { id: authentUser.user_id },
                        data: { user_status: 'Offline' }
                    });
                    // Notify friends that this user is now Offline
                    const friends = await FriendService.getFriendIds(authentUser.user_id);
                    friends.forEach(fId => {
                        io.to(fId).emit('status:update', 
                            { 
                                userId: authentUser.user_id, 
                                status: 'Offline'
                            })
                    });
                }
            } catch (e) {
                console.error('Failed to update status to Offline:', e);
            }
            userConversationCache.clear();
        })
        /**************************************************************************************** */
        socket.on('typing:start', onTypingStart);
        socket.on('join-chat', onJoinChannel)
        
    });
    return io;
}

export const getIo = () => {
    if (!io)
        throw new Error('IO not initialized');
    return io;
}