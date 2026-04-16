import { Router } from "express";
import { authenticated } from "../../middlewares/auth.middleware.js";
import { ConversationController } from "./conversation.controller.js";
import { MessagesController } from "../message/message.controller.js";

const   routes = Router();
/**
 * @ conversation routesges
 * 
 */


routes.get('/conversations', authenticated, ConversationController.listConversations);
routes.post('/conversations', authenticated, ConversationController.startConversation);
routes.delete('/conversations/:convId', authenticated, ConversationController.deleteConversation);

/**
 * @ messages routes
 */

routes.get('/conversations/:convId/messages', authenticated, MessagesController.getMessagesByConvId);
routes.get('/friend/:friendId/messages', authenticated, MessagesController.getMessagesByFriendId);

routes.post('/conversations/:convId/message', authenticated, MessagesController.sendMessage);

export default routes;