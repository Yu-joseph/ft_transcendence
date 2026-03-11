import  'dotenv/config';
import  http    from    'node:http';
import  app     from    './app.js';
import { connectDB } from './utils/connectDb.js';
import { prisma } from './lib/prisma.js';
// dotenv.config();


const   startServer = async () => {
    const   PORT = process.env.PORT || 3000;
    const   server = http.createServer(app);
    await connectDB();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
    
}
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
})

startServer();
