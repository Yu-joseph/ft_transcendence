import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { ConversationController } from "./conversation.controller.js";

const   routes = Router();

routes.get('/conversations', authenticate, ConversationController.listConversations);
routes.post('/conversations', authenticate, ConversationController.startConversation);
routes.delete('/conversations/:convId', authenticate, )

export default routes;