# Insigna User Management API

A RESTful API built with Node.js, Express, TypeScript, MongoDB, and JWT authentication.

## Features

- ✅ CRUD operations for user management
- ✅ MongoDB integration with Mongoose
- ✅ JWT authentication and authorization
- ✅ Password hashing with bcrypt
- ✅ Input validation using Joi
- ✅ TypeScript for type safety
- ✅ Proper error handling and HTTP status codes
- ✅ Comprehensive unit tests with Jest
- ✅ **Interactive Swagger/OpenAPI documentation**

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the project root:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/insigna-users
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

3. Make sure MongoDB is running locally or update the `MONGODB_URI` with your MongoDB Atlas connection string.

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm run serve
```

### Direct Start
```bash
npm start
```

The server will start at `http://localhost:3000`

## 📚 API Documentation

### Swagger UI (Interactive Documentation)
Once the server is running, visit:
```
http://localhost:3000/api-docs
```

This provides:
- **Interactive API testing** - Try out endpoints directly from the browser
- **Complete request/response schemas**
- **Authentication testing** - Add JWT tokens and test protected routes
- **Example requests and responses**

### OpenAPI JSON Specification
```
http://localhost:3000/api-docs.json
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2025-10-18T10:30:00.000Z"
  }
}
```

### User Management

#### Create User (Public)
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response: 201 Created**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-10-18T10:30:00.000Z"
  }
}
```

#### Get All Users (Protected)
```http
GET /api/users
Authorization: Bearer <your-jwt-token>
```

**Response: 200 OK**
```json
{
  "count": 2,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-10-18T10:30:00.000Z"
    }
  ]
}
```

#### Get User by ID (Protected)
```http
GET /api/users/:id
Authorization: Bearer <your-jwt-token>
```

**Response: 200 OK**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-10-18T10:30:00.000Z"
  }
}
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response: 200 OK**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "createdAt": "2025-10-18T10:30:00.000Z"
  }
}
```

#### Delete User
```http
DELETE /api/users/:id
```

**Response: 200 OK**
```json
{
  "message": "User deleted successfully"
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (duplicate email)
- `500 Internal Server Error` - Server error

## Project Structure

```
src/
├── config/
│   ├── database.ts          # MongoDB connection
│   └── swagger.ts            # Swagger/OpenAPI configuration
├── controllers/
│   ├── authController.ts    # Authentication logic
│   └── userController.ts    # User CRUD operations
├── middleware/
│   └── auth.ts              # JWT authentication middleware
├── models/
│   └── User.ts              # User model schema
├── routes/
│   ├── authRoutes.ts        # Authentication routes
│   └── userRoutes.ts        # User routes
├── validators/
│   └── userValidator.ts     # Joi validation schemas
├── __tests__/
│   ├── auth.test.ts         # Authentication tests
│   ├── user.test.ts         # User CRUD tests
│   └── setup.ts             # Test configuration
├── app.ts                   # Express app configuration
└── index.ts                 # Application entry point
```

## Testing

### Run all tests with coverage
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with verbose output
```bash
npm run test:verbose
```

**Test Results:**
- 30 unit tests (all passing ✅)
- 82% code coverage
- Tests cover all CRUD operations, authentication, validation, and edge cases

## Testing with Swagger UI

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000/api-docs`
3. **Create a user**: Try the `POST /api/users` endpoint
4. **Login**: Use `POST /api/login` with the created user credentials
5. **Authorize**: Click the "Authorize" button (🔒) at the top
6. **Add token**: Enter your JWT token (copy from login response)
7. **Test protected routes**: Now you can test `GET /api/users` and `GET /api/users/:id`

## Testing with cURL

### 1. Create a user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### 3. Get all users (with token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Joi** - Input validation
- **dotenv** - Environment variables
- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **Swagger/OpenAPI** - API documentation
- **MongoDB Memory Server** - In-memory database for tests

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected routes with authentication middleware
- Input validation to prevent injection attacks
- Unique email constraint
- Environment variable protection

## License

ISC
