import { Router } from 'express';
import { protect } from '../middleware/auth';
import { updateReview, deleteReview } from '../controllers/reviewController';
import { TypedAuthRequestHandler } from '../types/express';

const router = Router();

router.route('/:id')
    .put(protect as unknown as TypedAuthRequestHandler, updateReview as unknown as TypedAuthRequestHandler)
    .delete(protect as unknown as TypedAuthRequestHandler, deleteReview as unknown as TypedAuthRequestHandler);

export default router; 