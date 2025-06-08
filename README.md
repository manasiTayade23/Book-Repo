# Book Review API

A RESTful API for a Book Review system built with Node.js, Express, and PostgreSQL.

## Features

- User authentication with JWT
- CRUD operations for books and reviews
- Search functionality for books
- Pagination for books and reviews
- User-specific content management
- TypeScript implementation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd book-review-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database and update the `.env` file in the root directory with your database configuration:
```env
PORT=7000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/book_review_api
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h
```

4. Build and start the server:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Register a new user
```http
POST /api/auth/signup
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Books

#### Create a new book (Protected)
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "description": "A story of the fabulously wealthy Jay Gatsby",
    "publishedYear": 1925
}
```

#### Create multiple books (Protected)
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

[
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "genre": "Fantasy",
        "description": "A story about Bilbo Baggins' unexpected journey",
        "publishedYear": 1937
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "genre": "Science Fiction",
        "description": "A dystopian social science fiction novel",
        "publishedYear": 1949
    }
]
```

#### Get all books (with pagination and filters)
```http
GET /api/books?page=1&limit=10&author=Fitzgerald&genre=Fiction
```

#### Get book by ID (with reviews)
```http
GET /api/books/:id?page=1&limit=10
```

#### Search books
```http
GET /api/books/search?query=gatsby
```

#### Get user's content (Protected)
```http
GET /api/books/me/content?page=1&limit=10
Authorization: Bearer <token>
```

### Reviews

#### Create a review (Protected)
```http
POST /api/books/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
    "rating": 5,
    "comment": "A masterpiece of American literature!"
}
```

#### Update a review (Protected)
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
    "rating": 4,
    "comment": "Updated review comment"
}
```

#### Delete a review (Protected)
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## Database Schema

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Books
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    "publishedYear" INTEGER NOT NULL,
    "averageRating" FLOAT DEFAULT 0,
    "totalReviews" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT genre_check CHECK (genre IN ('Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Other'))
);
```

### Reviews
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "bookId" INTEGER REFERENCES books(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5),
    UNIQUE("userId", "bookId")
);
```

## Response Formats

### Success Response
```json
{
    "success": true,
    "data": {
        // Response data here
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error message here"
}
```

### Pagination Response
```json
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 50,
        "totalPages": 5,
        "hasNextPage": true,
        "hasPrevPage": false
    },
    "data": [
        // Array of items
    ]
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

## Design Decisions

1. **TypeScript Implementation**: Chose TypeScript for better type safety and improved development experience.
2. **PostgreSQL**: Selected for its robust support for complex queries and data integrity constraints.
3. **JWT Authentication**: Implemented for stateless authentication and better scalability.
4. **Modular Architecture**: Organized code into models, controllers, and routes for better maintainability.
5. **Pagination**: Implemented for all list endpoints to handle large datasets efficiently.
6. **User Content Management**: Added dedicated endpoint for users to manage their reviews.
7. **Bulk Operations**: Support for creating multiple books in a single request.
8. **Data Validation**: Implemented comprehensive validation for all inputs using Sequelize validators.
