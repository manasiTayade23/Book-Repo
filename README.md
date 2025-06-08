# Book Review API

A RESTful API for a Book Review system built with Node.js, Express, and PostgreSQL.

## Features

- User authentication with JWT
- CRUD operations for books and reviews
- Search functionality for books
- Pagination for books and reviews
- Role-based access control
- Docker support for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Docker and Docker Compose (optional)

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd book-review-api
```

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

The API will be available at http://localhost:3000, and PostgreSQL will be running on port 5432.

### Manual Installation

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
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/book_review_api
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h
```

4. Start the server:
```bash
npm start
```

## Docker Commands

### Start the application
```bash
docker-compose up
```

### Start in detached mode
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild the application
```bash
docker-compose up --build
```

### Remove volumes (database data)
```bash
docker-compose down -v
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

#### Get all books (with pagination and filters)
```http
GET /api/books?page=1&limit=10&author=Fitzgerald&genre=Fiction
```

#### Get book by ID (with reviews)
```http
GET /api/books/:id
```

#### Search books
```http
GET /api/search?query=gatsby
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

## Error Handling

The API uses consistent error responses:

```json
{
    "success": false,
    "message": "Error message here"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Users are limited to 100 requests per hour.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
