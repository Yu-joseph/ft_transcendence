import  { Router }  from    'express';
import { ProfileController } from './profileController.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const   routes = Router();

// routes.get('/me', authenticate, ProfileController.viewProfile);
routes.get('/:id', authenticate, ProfileController.viewProfile);
export default routes;
