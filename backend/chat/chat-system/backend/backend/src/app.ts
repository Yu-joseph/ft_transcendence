import  express         from    'express';
import  friendRoutes    from    './modules/friend/friend.routes.js';
import { prisma } from './lib/prisma.js';
const   app = express();


app.use(express.json());
app.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
    
        res.json({users: users});
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }


})   

app.get('/api/friend', async (req, res) => {
    try {
        const   list = await prisma.friend.findMany();
        console.log("Friend request:", list);
        res.status(200).json({success: true, data: list})
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({message: error.message})
    }
})

app.use('/api/friend', friendRoutes);

export  default app;