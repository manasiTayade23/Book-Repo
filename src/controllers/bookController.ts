import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Book from '../models/Book';
import Review from '../models/Review';
import User from '../models/User';
import { UserInstance } from '../models/User';
import { sequelize } from '../config/database';

interface QueryParams {
    page?: string;
    limit?: string;
    author?: string;
    genre?: string;
    query?: string;
}

interface AuthRequest extends Request {
    user: UserInstance;
}

interface RawStats {
    averageRating: any;
    totalReviews: any;
}

interface ReviewStats {
    averageRating: number | null;
    totalReviews: number;
}

// @desc    Create new book(s)
// @route   POST /api/books
// @access  Private
export const createBook = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Check if the request body is an array
        const isMultipleBooks = Array.isArray(req.body);
        
        if (isMultipleBooks) {
            // Validate each book in the array
            for (const book of req.body) {
                if (!book.title || !book.author || !book.genre || !book.description || !book.publishedYear) {
                    return res.status(400).json({
                        success: false,
                        message: 'Please provide all required fields for each book: title, author, genre, description, publishedYear'
                    });
                }
            }
            
            // Create multiple books
            const books = await Book.bulkCreate(req.body, {
                validate: true
            });

            return res.status(201).json({
                success: true,
                count: books.length,
                data: books
            });
        } else {
            // Single book creation
            if (!req.body.title || !req.body.author || !req.body.genre || !req.body.description || !req.body.publishedYear) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields: title, author, genre, description, publishedYear'
                });
            }

            const book = await Book.create(req.body);

            return res.status(201).json({
                success: true,
                data: book
            });
        }
    } catch (error: any) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map((err: any) => err.message);
            return res.status(400).json({
                success: false,
                message: messages
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all books with pagination and filters
// @route   GET /api/books
// @access  Public
export const getBooks = async (req: Request, res: Response): Promise<Response> => {
    try {
        const queryParams = req.query as QueryParams;
        const page = parseInt(queryParams.page || '1');
        const limit = parseInt(queryParams.limit || '10');
        const startIndex = (page - 1) * limit;

        // Build query
        const query: any = {};

        // Add author filter
        if (queryParams.author) {
            query.author = {
                [Op.iLike]: `%${queryParams.author}%`
            };
        }

        // Add genre filter
        if (queryParams.genre) {
            query.genre = queryParams.genre;
        }

        const books = await Book.findAndCountAll({
            where: query,
            limit,
            offset: startIndex,
            include: [{
                model: Review,
                include: [{
                    model: User,
                    attributes: ['username']
                }]
            }],
            distinct: true // This ensures correct count with associations
        });

        return res.status(200).json({
            success: true,
            pagination: {
                page,
                limit,
                totalBooks: books.count,
                totalPages: Math.ceil(books.count / limit),
                hasNextPage: page < Math.ceil(books.count / limit),
                hasPrevPage: page > 1
            },
            data: books.rows
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req: Request, res: Response): Promise<Response> => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const startIndex = (page - 1) * limit;

        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Get reviews with pagination
        const reviews = await Review.findAndCountAll({
            where: { bookId: req.params.id },
            limit,
            offset: startIndex,
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Get book statistics
        const rawStats = await Review.findOne({
            where: { bookId: req.params.id },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
            ],
            raw: true
        }) as unknown;

        const stats = rawStats as RawStats;

        const averageRating = stats ? parseFloat(Number(stats.averageRating).toFixed(1)) : 0;
        const totalReviews = stats ? parseInt(String(stats.totalReviews)) : 0;

        return res.status(200).json({
            success: true,
            data: {
                ...book.toJSON(),
                statistics: {
                    averageRating,
                    totalReviews
                },
                reviews: {
                    pagination: {
                        page,
                        limit,
                        totalReviews: reviews.count,
                        totalPages: Math.ceil(reviews.count / limit),
                        hasNextPage: page < Math.ceil(reviews.count / limit),
                        hasPrevPage: page > 1
                    },
                    data: reviews.rows
                }
            }
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Search books
// @route   GET /api/search
// @access  Public
export const searchBooks = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { query } = req.query as QueryParams;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query'
            });
        }

        const books = await Book.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${query}%` } },
                    { author: { [Op.iLike]: `%${query}%` } }
                ]
            }
        });

        return res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's books and reviews
// @route   GET /api/books/me
// @access  Private
export const getUserContent = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const startIndex = (page - 1) * limit;

        // Get user's reviews with book details
        const reviews = await Review.findAndCountAll({
            where: { userId: req.user.id },
            limit,
            offset: startIndex,
            include: [{
                model: Book,
                attributes: ['id', 'title', 'author', 'genre']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            pagination: {
                page,
                limit,
                totalReviews: reviews.count,
                totalPages: Math.ceil(reviews.count / limit),
                hasNextPage: page < Math.ceil(reviews.count / limit),
                hasPrevPage: page > 1
            },
            data: {
                reviews: reviews.rows
            }
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 