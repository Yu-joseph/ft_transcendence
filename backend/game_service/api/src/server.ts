import  'dotenv/config';
import  http            from    'node:http';
import  { app, corsOrigins }  from    './index';
import  { connectDB }   from    './utils/connectDb';
import  { prisma }      from    './lib/prisma';
import  { Server }      from    'socket.io';
import  { setupSocketHandlers }       from  './socket/handlers';
import  { setupTournamentHandlers }   from  './socket/tournament/tournament';

const   PORT = process.env.PORT || 3000;
const   server = http.createServer(app);

let io: Server;

const   initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: corsOrigins,
            credentials: true,
            optionsSuccessStatus: 200
        }
    });
    console.log("[🔌] Socket.IO engine initialized on HTTP server...");

    setupSocketHandlers(io);
    setupTournamentHandlers(io);

    return io;
}

const   startServer = async () => {
    try {
        initSocket(server);

        await connectDB();
        server.listen(PORT, () => {
                console.log(`[🚀] Game service running on port ${PORT}...`)
            }
        );
    } catch (error) {
        console.error('[❌] Failed to start server:', error);
        process.exit(1);
    }
}

/** handling crash and shutdowning  */

const   shutdown = async (signal: string) => {
    console.log(`\n[🛑] Received ${signal}. Shutting down gracefully...`);
    // stop accepting new HTTP request
    server.close(async () => {
        console.log('[HTTP] Server closed.');
        try {
            if(io) {
                io.close();
                console.log('[SOCKET] Websockets disconnected.');
            }
            await prisma.$disconnect();
            console.log('[DB] Prisma disconnected.');

            console.log('[✅] Graceful shutdown complete. Exiting.');
            process.exit(0);
        } catch (error) {
            console.error('[❌] Error during shutdown:', error);
            process.exit(1);
        }
    })
    // if the shutdown take long than 10 seconds, i force shutting down it.
    setTimeout(() => {
        console.error('[⚠️] Forcefully shutting down after 10s timeout.');
        process.exit(1);
    }, 10000);
}

// Handling Docker stop (SIGTERM) && Ctrl-C (SIGINT)
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// this prevent Node from crashing instantly on unhandled throw/promises
process.on('uncaughtException', (reason) => {
    console.error('[💥] UNHANDLED EXCEPTION:', reason);
    shutdown('UNCAUGHT_EXCEPTION');
})
process.on('unhandledRejection', (reason) => {
    console.error('[💥] UNHANDLED REJECTION:', reason);
})

startServer();