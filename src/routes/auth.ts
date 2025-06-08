import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { TypedRequestHandler } from '../types/express';

const router = Router();

router.post('/signup', signup as unknown as TypedRequestHandler);
router.post('/login', login as unknown as TypedRequestHandler);

export default router; 