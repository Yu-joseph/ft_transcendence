import  { Response }    from 'express';
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { ResponseModule }       from    '../shared.utils.js';
import { ConversationService } from './conversation.service.js';
import { ExistingConversationsT } from './conversation.types.js';

export class    ConversationController {
    /**
     * @function listConversations get all conversations of userId
     */
    static async listConversations(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.id as number;

            const   result = await ConversationService.listConversations(userId);

            const   response: ResponseModule<any> = {
                success: true,
                message: 'Getting conversations success',
                data: result
            } 
            return res.status(200).json(response);
        } catch (error: any) {
            const   response: ResponseModule<null> = {
                success: false,
                message: error.message || 'Internal server error',
                data: null
            }
            const   statusCode = error.statusCode;
            console.log(error.message);
            res.status(error.statusCode || 500).json(response);
            
        }
    }
     /**
     * @function startConversation req.user.id create new conversation with otherUserId
     */
    static async startConversation(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.id;
            const   otherUserId = Number(req.body.otherUserId);
            if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
                const   response: ResponseModule<null> = {
                    success: false,
                    message: 'Bad user ID. Please enter valid otherUserId and try again.',
                    data: null
                };
                return  res.status(400).json(response);
            }
            const   result = await ConversationService.startConversation({userId, otherUserId});

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
            const   response: ResponseModule<null> = {
                success: false,
                message: error.message || 'Internal server error',
                data: null
            }
            console.log(error.message);

            return res.status(statusCode).json(response);
        }
    }
         /**
     * @function deleteConversation req.user.id delete a single conversation by it's ID
     */
    // static async deleteConversation(req: AuthenticatedRequest, res: Response) {
    //     try {
    //         const   currentUserId = req.user?.id;
    //         const   conversationId = Number(req.params.id);

    //         if (!Number.isInteger(conversationId) || conversationId <= 0) {
    //             const   response: ResponseModule<null> = {success: false, message: 'Invalid Conversation ID', data: null};
    //             return res.status(400).json(response);
    //         }
    //         const   result = await ConversationService.deleteConversation({currentUserId, conversationId})


    //     } catch (error: any) {
            
    //     }

    // }
}