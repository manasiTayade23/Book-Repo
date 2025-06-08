import User from './User';
import Book from './Book';
import Review from './Review';

// Define associations
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Book, { foreignKey: 'bookId' });
Book.hasMany(Review, { foreignKey: 'bookId' });
User.hasMany(Review, { foreignKey: 'userId' });

// Add hooks for Review model
Review.addHook('afterCreate', async (review: any) => {
    const book = await Book.findByPk(review.bookId);
    if (book) {
        await book.updateRatingStatistics();
    }
});

Review.addHook('afterUpdate', async (review: any) => {
    const book = await Book.findByPk(review.bookId);
    if (book) {
        await book.updateRatingStatistics();
    }
});

Review.addHook('afterDestroy', async (review: any) => {
    const book = await Book.findByPk(review.bookId);
    if (book) {
        await book.updateRatingStatistics();
    }
});

export { User, Book, Review }; 