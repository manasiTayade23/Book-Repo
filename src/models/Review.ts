import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ReviewAttributes {
    id: number;
    rating: number;
    comment: string;
    userId: number;
    bookId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

interface ReviewInstance extends Model<ReviewAttributes, ReviewCreationAttributes>, ReviewAttributes {}

const Review = sequelize.define<ReviewInstance>('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Rating must be at least 1'
            },
            max: {
                args: [5],
                msg: 'Rating cannot be more than 5'
            }
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [1, 500],
                msg: 'Review cannot be more than 500 characters'
            }
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Books',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

// Add a unique constraint to prevent multiple reviews from the same user for the same book
Review.addHook('beforeValidate', async (review: ReviewInstance) => {
    if (review.isNewRecord) {
        const existingReview = await Review.findOne({
            where: {
                userId: review.userId,
                bookId: review.bookId
            }
        });
        if (existingReview) {
            throw new Error('You have already reviewed this book');
        }
    }
});

export default Review; 