# AChan - Image Board Application

A modern image board application built with TypeScript, Express, and Prisma.

## Features

- Board management (create, read, update, delete)
- Thread creation with image uploads
- Replies with optional images
- Nested replies
- Image processing (thumbnails, metadata extraction)
- API documentation with Swagger UI

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Image Processing**: Sharp
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino, Morgan

## Project Structure

```
achan/
├── prisma/                  # Prisma schema and migrations
├── public/                  # Static files
│   └── uploads/             # Uploaded images and thumbnails
├── src/
│   ├── api/                 # API routes and controllers
│   │   ├── boards/          # Board-related endpoints
│   │   ├── threads/         # Thread-related endpoints (to be implemented)
│   │   └── replies/         # Reply-related endpoints (to be implemented)
│   ├── core/                # Core utilities and middleware
│   │   └── middleware/      # Express middleware
│   ├── services/            # Business logic services
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── .env                     # Environment variables (not committed)
├── .env.example             # Example environment variables
├── swagger.yaml             # API documentation
└── package.json             # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure your database connection
4. Generate Prisma client:
   ```
   npm run prisma:generate
   ```
5. Run database migrations:
   ```
   npm run prisma:migrate
   ```
6. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Current Status

- ✅ Project setup and configuration
- ✅ Database schema with Prisma
- ✅ Core middleware (error handling, validation, image upload)
- ✅ Board management API endpoints
- ✅ Thread creation and management
- ⬜ Reply creation and management
- ✅ Image processing for threads
- ⬜ Image processing for replies
- ⬜ Authentication for admin actions

## Next Steps

1. Implement reply creation and management endpoints
2. Add authentication for admin actions
3. Add tests for API endpoints
4. Implement frontend application

## License

This project is licensed under the MIT License.
