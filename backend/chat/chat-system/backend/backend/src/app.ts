import  express         from    'express';
import  friendRoutes    from    './modules/friend/friend.routes.js';
import  chatRoutes      from    './modules/conversation/conversation.routes.js';
import  profileRoutes   from    './modules/profile/profile.routes.js';
import  { Request, Response, NextFunction }   from    'express';
import { prisma } from './lib/prisma.js';
const   app = express();


app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    
    console.log('00000000000000000000000000000000000000000000000000000000');

    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format',
            data: null
        });
    }
    next(err);
})

app.get('/', async (req, res) => {
    try {
        const   result = await prisma.friend.createMany({
            data: [
                    {receiverId: 1, requesterId: 2},
                    {receiverId: 1, requesterId: 3},
                    {receiverId: 4, requesterId: 1}
                // {email: 'user1@gmail.com', username: 'mait', password: '1234'},
                // {email: 'user2@gmail.com', username: 'simo', password: '1234'},
                // {email: 'user3@gmail.com', username: 'djant', password: '1234'},
                // {email: 'user4@gmail.com', username: 'alice', password: '1234'}
            ]
        })
        console.log(result);
        const users = await prisma.user.findMany();
    
        res.json({users: users});
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }


})   


/*  __ Friend Module API __  */
app.use('/api/friend', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);


export  default app;