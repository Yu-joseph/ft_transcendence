import  'dotenv/config';
import  http            from    'node:http';
import  {app}             from    './index.js';
import  { connectDB }   from    './utils/connectDb.js';
import  { prisma }      from    './lib/prisma.js';
import { Server } from "express";
import { createServer } from "http";

const   PORT = process.env.PORT || 3000;
const   server = http.createServer(app);

export const   corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ["http://localhost:8080"];

const initSocket = (app:Server) => {

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
    cors: {
            origin: corsOrigins,
            credentials: true,
            optionsSuccessStatus: 200
    }
    });
}

const   startServer = async () => {
    try {
        initSocket(server);

        await connectDB();
        server.listen(PORT, () => {
                console.log(`[🚀] game service running on port ${PORT}...`)
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
            const   io = getIo();
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

startServer();