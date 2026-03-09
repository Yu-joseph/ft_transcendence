import  'dotenv/config';
import  http    from    'node:http';
import  app     from    './app.js';
import { connectDB } from './utils/connectDb.js';
import { prisma } from './lib/prisma.js';
import { Server } from 'socket.io';
// dotenv.config();


const   startServer = async () => {
    const   PORT = process.env.PORT || 3000;
    const   server = http.createServer(app);
    const   io = new Server(server);
    await connectDB();
    // io.on
    server.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
    
}
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
})

startServer();
