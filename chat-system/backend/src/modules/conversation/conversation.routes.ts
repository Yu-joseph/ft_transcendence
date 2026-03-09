import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { ConversationController } from "./conversation.controller.js";
import { MessagesController } from "../message/message.controller.js";

const   routes = Router();
/**
 * @ conversation routesges
 */
routes.get('/conversations', authenticate, ConversationController.listConversations);
routes.post('/conversations', authenticate, ConversationController.startConversation);
routes.delete('/conversations/:id', authenticate, ConversationController.deleteConversation);

/**
 * @ messages routes
 */

routes.get('/conversations/:id/messages', MessagesController.getMessages);
routes.post('/conversations/:id/message', MessagesController.sendMessage);


export default routes;