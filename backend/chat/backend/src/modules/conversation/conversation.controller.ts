import  { Response }    from 'express';
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { ResponseModule }       from    '../shared.utils.js';
import { ConversationService } from './conversation.service.js';
import { ExistingConversationsT } from './conversation.types.js';
import { AppError } from '../../utils/AppError.js';

export class    ConversationController {
    /**
     * @function listConversations get all conversations of userId
     */
    static async listConversations(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.user_id;
            if (!userId)
                return res.status(401).json({message: 'Not authorized'});
            const   result = await ConversationService.listConversations(userId);

            const   response: ResponseModule<any> = {
                success: true,
                message: 'Getting conversations success',
                data: result
            } 
            return res.status(200).json(response);
        } catch (error: any) {
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            const   response: ResponseModule<null> = {
                success: false,
                message: errorMessage,
                data: null
            }
            const   statusCode = error.statusCode;
            console.log(errorMessage);
            res.status(error.statusCode || 500).json(response);
            
        }
    }
     /**
     * @function startConversation req.user.id create new conversation with otherUserId
     */
    static async startConversation(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.user_id;
            if(!userId)
                return res.status(401).json({message: 'Not authorized'});

            const   friendId = req.body.friendId;

            const   result = await ConversationService.startConversation({userId, friendId});

            const response: ResponseModule<ExistingConversationsT> = {
                success: true,
                message: result.statusOfRes.message,
                data: {
                    id: result.id,
                    otherUser: result.otherUser,
                    lastMessage: result.lastMessage,
                    updated_at: result.updated_at
                }
            };
            return res.status(result.statusOfRes.statusCode).json(response);

        } catch (error: any) {
            const   statusCode = error.statusCode || 500;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            const   response: ResponseModule<null> = {
                success: false,
                message: errorMessage,
                data: null
            }
            console.log(errorMessage);

            return res.status(statusCode).json(response);
        }
    }
    
    /**
    * next feature,
    * @function deleteConversation req.user.id delete a single conversation by it's ID
    */
    // static async deleteConversation(req: AuthenticatedRequest, res: Response) {
    //     try {
    //         const   currentUserId = req.user?.user_id as string;
    //         const   conversationId = req.params.convId;
    //         const   result: bigint = await ConversationService.deleteConversation({currentUserId, conversationId});
    //         const   response: ResponseModule<bigint> = {
    //             success: true,
    //             message: 'Conversation deleted',
    //             data: result
    //         };
    //         return res.status(200).json(response);

    //     } catch (error: any) {
    //         const   statusCode = error.statusCode || 500;
            
    //         const   response: ResponseModule<null> = {
    //             success: false,
    //             message: error.message || 'Internal server error',
    //             data: null
    //         }
    //         return res.status(statusCode).json(response);
    //     }
    // }
}