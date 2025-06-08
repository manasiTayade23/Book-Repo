import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createBook, getBooks, getBook, searchBooks, getUserContent } from '../controllers/bookController';
import { createReview } from '../controllers/reviewController';
import { TypedRequestHandler, TypedAuthRequestHandler } from '../types/express';

const router = Router();

// Public routes
router.get('/', getBooks as unknown as TypedRequestHandler);
router.get('/search', searchBooks as unknown as TypedRequestHandler);
router.get('/:id', getBook as unknown as TypedRequestHandler);

// Protected routes
router.use(protect as unknown as TypedAuthRequestHandler);
router.post('/', createBook as unknown as TypedRequestHandler);
router.post('/:id/reviews', createReview as unknown as TypedAuthRequestHandler);
router.get('/me/content', getUserContent as unknown as TypedAuthRequestHandler);

export default router; 