import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import config from './config/env';

// Import routes
import authRoutes from './routes/auth';
import bookRoutes from './routes/book';
import reviewRoutes from './routes/review';

// Import model associations
import './models/associations';

// Connect to database
connectDB();

const app: Express = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error'
    });
});

export default app; 