import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { FriendController } from "./friend.controller.js";
const routes = Router();



routes.post('/request', authenticate, FriendController.addFriend);
routes.put('/:id/accept', authenticate, FriendController.acceptFriend);
routes.put('/:id/reject', authenticate, FriendController.rejectFriend);
routes.delete('/:id', authenticate, FriendController.removeFriendShip); 
routes.delete('/:id/cancel', authenticate, FriendController.cancelFriend);
routes.get('/', authenticate, FriendController.getFriends);
routes.get('/pending', authenticate, FriendController.getPendingFriend);
routes.get('/rejected', authenticate, FriendController.getRejectedFriend);


export  default routes;