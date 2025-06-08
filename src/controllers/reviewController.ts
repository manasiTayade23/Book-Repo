import { Request, Response } from 'express';
import Review from '../models/Review';
import Book from '../models/Book';
import { UserInstance } from '../models/User';

// Extend Express Request type to include user
interface AuthRequest extends Request {
    user: UserInstance;
}

// @desc    Create new review
// @route   POST /api/books/:id/reviews
// @access  Private
export const createReview = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        req.body.bookId = req.params.id;
        req.body.userId = req.user.id;

        // Check if book exists
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if user already reviewed this book
        const existingReview = await Review.findOne({
            where: {
                userId: req.user.id,
                bookId: req.params.id
            }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this book'
            });
        }

        const review = await Review.create(req.body);

        return res.status(201).json({
            success: true,
            data: review
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        let review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Make sure user owns review
        if (review.userId !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        review = await review.update(req.body);

        return res.status(200).json({
            success: true,
            data: review
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Make sure user owns review
        if (review.userId !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await review.destroy();

        return res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 