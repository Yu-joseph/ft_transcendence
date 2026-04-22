import { Router } from "express";
import { authenticated } from "../../middlewares/auth.middleware.js";
import { FriendController } from "./friend.controller.js";
import { friendRequestLimiter } from "../../middlewares/friend.rate.limit.midllware.js";
const routes = Router();



routes.get('/', authenticated, FriendController.getFriends);
routes.post('/request', friendRequestLimiter, authenticated, FriendController.addFriend);
routes.put('/:id/accept', authenticated, FriendController.acceptFriend);
routes.put('/:id/reject', authenticated, FriendController.rejectFriend);
routes.delete('/:id', authenticated, FriendController.removeFriendShip); 
routes.delete('/:id/cancel', authenticated, FriendController.cancelFriend);
routes.get('/pending', authenticated, FriendController.getPendingFriend);
routes.get('/rejected', authenticated, FriendController.getRejectedFriend);

routes.get('/:id', authenticated, FriendController.getFriendById); 

export  default routes;
