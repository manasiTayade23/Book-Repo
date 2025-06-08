import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

type Genre = 'Fiction' | 'Non-Fiction' | 'Science Fiction' | 'Fantasy' | 'Mystery' | 'Thriller' | 'Romance' | 'Other';

interface BookAttributes {
    id: number;
    title: string;
    author: string;
    genre: Genre;
    description: string;
    publishedYear: number;
    averageRating: number;
    totalReviews: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BookCreationAttributes extends Optional<BookAttributes, 'id' | 'averageRating' | 'totalReviews'> {}

interface BookInstance extends Model<BookAttributes, BookCreationAttributes>, BookAttributes {
    updateRatingStatistics(): Promise<void>;
}

const Book = sequelize.define<BookInstance>(
    'Book',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 100],
                    msg: 'Title cannot be more than 100 characters'
                }
            }
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false
        },
        genre: {
            type: DataTypes.ENUM('Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Other'),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 500],
                    msg: 'Description cannot be more than 500 characters'
                }
            }
        },
        publishedYear: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        averageRating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 5
            }
        },
        totalReviews: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
        timestamps: true
    }
);

interface RatingStats {
    averageRating: number;
    totalReviews: number;
}

const instanceMethods = {
    async updateRatingStatistics(this: BookInstance): Promise<void> {
        const stats = await sequelize.models.Review.findOne({
            where: { bookId: this.id },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
            ],
            raw: true
        }) as RatingStats | null;

        if (stats) {
            this.averageRating = Math.round(stats.averageRating * 10) / 10 || 0;
            this.totalReviews = stats.totalReviews || 0;
            await this.save();
        }
    }
};

Object.assign(Book.prototype, instanceMethods);

export default Book; 