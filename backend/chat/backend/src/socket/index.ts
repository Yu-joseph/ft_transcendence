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
        socket.on('typing:start', (room_id) => {
            socket.to(room_id).emit('typing:start', `In Room ${room_id} is typing`);
        })
        socket.on('typing:stop', (room_id) => {
            socket.to(room_id).emit('typing:stop', `In Room ${room_id} is stopped`);
        })  
        socket.on('disconnect', () => console.log(`User Disconnected, socketId: ${socket.id}`))
    });
    return io;
}

export const getIo = () => {
    if (!io)
        throw new Error('IO not initialized');
    return io;
}