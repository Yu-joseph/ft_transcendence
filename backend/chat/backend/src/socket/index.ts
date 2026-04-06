import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: Server;

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: '*'
        }
    })

    io.on('connection', (socket) => {
        console.log(`A user connected, socketId: ${socket.id}`);

        socket.on('join-chat', (ROOM_Id: string) => {
            socket.join(ROOM_Id);
            console.log(`I'm Joining the Room ${ROOM_Id}`);
        })
        socket.on('disconnect', () => console.log(`User Disconnected, socketId: ${socket.id}`))
    })
    return io;
}

export const getIo = () => {
    if (!io)
        throw new Error('IO not initialized');
    return io;
}