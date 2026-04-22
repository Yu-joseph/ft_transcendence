import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { socketAuthenticate } from '../middlewares/socket.auth.middleware.js';
import { JoinChatInf } from './socket.types.js';
import prisma from '../lib/prisma.js';

let io: Server;

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: ['https://localhost:8443', 'https://10.30.234.188:8443'],
            credentials: true
        }
    })
    io.use(socketAuthenticate);
    io.on('connection', (socket) => {
        socket.join((socket as any).user.user_id); // for conversation Update list, so i emit the event for the sender and receiver
        console.log('I join my Private Room:', (socket as any).user.user_id);
        const   onJoinChannel = async (data: JoinChatInf) => {
            if(data.userId !== (socket as any).user.user_id){
                console.log('++++++++++++++++++  DIFF USERES +++++++++++++++++++++');
                return ;
            }
            const   userInConv = await prisma.conversation.findFirst({
                where: {OR: [{user1Id: data.userId}, {user2Id: data.userId}]}
            });
            if(userInConv === null) {
                console.log('+++++++++++++ THE USER NOT IN THAT CONVERSATION ++++++++++++++++++++');
                return;
            }
            socket.join(data.room_id);
            console.log(`I'm Joining the Room ${data.room_id}`);
        }

        const   onTypingStart = async (data: JoinChatInf) => {
            if(data.userId !== (socket as any).user.user_id){
                console.log('++++++++++++++++++  DIFF USERES +++++++++++++++++++++');
                return ;
            }
            const   userInConv = await prisma.conversation.findFirst({
                where: {OR: [{user1Id: data.userId}, {user2Id: data.userId}]}
            });
            if(userInConv === null) {
                console.log('+++++++++++++ THE USER NOT IN THAT CONVERSATION ++++++++++++++++++++');
                return;
            }
            socket.to(data.room_id).emit('typing:start', );
        }

        
        socket.on('leave:conversation', (room_id) => {
            console.log(`User ${(socket as any).user.user_id} leave conversation`);
            socket.leave(room_id);
            console.log(`I'm Leave the Room ${room_id}`);
        })
        socket.on('typing:stop', (room_id) => {
            socket.to(room_id).emit('typing:stop', `In Room ${room_id} is stopped`);
        })
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