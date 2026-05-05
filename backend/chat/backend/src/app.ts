import  express         from    'express';
import  cors            from    'cors';
import  friendRoutes    from    './modules/friend/friend.routes.js';
import  chatRoutes      from    './modules/conversation/conversation.routes.js';
import  profileRoutes   from    './modules/profile/profile.routes.js';
import  { Request, Response, NextFunction }   from    'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import apiLimiter from './utils/rateLimit.js';

const   app = express();
app.use(helmet());
app.use('/api', apiLimiter);

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const   corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ["http://localhost:8080"];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    optionsSuccessStattus: 200
}));

app.use(express.json({ limit: '10kb' }));
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


/** Health check endpoints for Docker / DevOps */
app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Chat system is healthy' });
});

/** to prevent server for sending HTML content for not found routes */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        data: null
    });
});
// Global Error Handler (prevents sending HTML res on crash)
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Error:", error); 
    res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        data: null
    });
});

export  default app;