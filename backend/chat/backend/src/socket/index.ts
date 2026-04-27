import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { socketAuthenticate } from '../middlewares/socket.auth.middleware.js';
import { JoinChatInf } from './socket.types.js';
import prisma from '../lib/prisma.js';
import z from 'zod';

let io: Server;

const   emitError = (socket: Socket, message: string) => {
    socket.emit('error' ,{message});
}

const joinChatSchema = z.object({
    room_id: z.string().min(1, 'Invalid room id')
                        .transform(val => val.trim()),
    /******************** */
    convId: z.string().regex(/^\d+$/, 'Invalid conversation ID')
                          .transform(val => BigInt(val)),
    /******************* */
    userId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform(val => val.trim())
})

const roomIdSchema = z.string().min(1);
/** User Othorization helper function */
const   isUserInConversation = async (convId: bigint, userId: string) => {
    return await prisma.conversation.findFirst({
        where: {
            id: convId,
            OR: [{ user1Id: userId }, { user2Id: userId }]
        }
    });
}
/**************** */

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: ['https://localhost:8443', 'https://10.30.234.188:8443'],
            credentials: true
        }
    })
    io.use(socketAuthenticate);
    io.on('connection', (socket) => {
        const   authentUser = (socket as any).user;

        socket.join(authentUser.user_id); // for conversation Update and notification , so i emit the event for the sender and receiver
        console.log('I join my Private Room:', authentUser.user_id);

        /**
         * ****  join chat handler ****
         **/
        const   onJoinChannel = async (data: JoinChatInf) => {
            const validatedData = joinChatSchema.safeParse(data);

            if(!validatedData.success || validatedData.data.userId !== authentUser.user_id){
                // console.log(validatedData.error?.issues);
                emitError(socket, 'Invalid request data');
                return ;
            }
            const  {room_id, convId, userId} = validatedData.data;

            if(await isUserInConversation(convId, userId)) {
                socket.join(room_id);
                console.log(`User ${userId} authorized and joined room ${room_id}`);
            }
        }
        /**
        * ****  typing start handler ****
        **/
        const   typingSchema = z.object({
            friendId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform(val => val.trim()),
            userId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform(val => val.trim()),
            convId: z.string().regex(/^\d+$/, 'Invalid conversation ID')
                          .transform(val => BigInt(val))
        });

        const   onTypingStart = async (data: unknown) => {
            const   validatedData = typingSchema.safeParse(data);
            if(!validatedData.success || validatedData.data.userId !== authentUser.user_id) {
                console.log(validatedData.error?.issues);
                emitError(socket, 'Invalid request data');
                return ;
            }
            const   {friendId, convId, userId} = validatedData.data;
            if (await isUserInConversation(convId, userId)) {
                socket.to(friendId).emit('typing:start');
            }
        }
        /**
        * ****  typing start handler ****
        **/
        const onTypingStop = async (data: unknown) => {
            const validated = typingSchema.safeParse(data);
            if (!validated.success || validated.data.userId !== authentUser.user_id) {
                emitError(socket, 'Invalid request data');
                return;
            }
            const   {friendId, convId, userId} = validated.data;
            if(await isUserInConversation(convId, userId)) {
                socket.to(friendId).emit('typing:stop');
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
        });



        socket.on('typing:stop', onTypingStop);
        socket.on('disconnect', () => console.log(`User Disconnected, socketId: ${socket.id}`))
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