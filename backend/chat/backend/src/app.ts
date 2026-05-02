import  express         from    'express';
import  cors            from    'cors';
import  friendRoutes    from    './modules/friend/friend.routes.js';
import  chatRoutes      from    './modules/conversation/conversation.routes.js';
import  profileRoutes   from    './modules/profile/profile.routes.js';
import  { Request, Response, NextFunction }   from    'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';

const   app = express();
app.use(helmet());
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
app.use(cors({
  origin: ['https://localhost:8443', 'https://10.30.234.188:8443', 'https://10.30.242.27:8443'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format',
            data: null
        });
    }
    next(err);
})
app.use('/api/friend', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

/** to prevent server for sending HTML content for not found routes */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        data: null
    });
});

export  default app;