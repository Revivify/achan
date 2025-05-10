import dotenv from 'dotenv';
dotenv.config(); // Load .env file

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  IMAGE_UPLOAD_DIR: process.env.IMAGE_UPLOAD_DIR || 'public/uploads/images',
  THUMBNAIL_UPLOAD_DIR: process.env.THUMBNAIL_UPLOAD_DIR || 'public/uploads/thumbnails',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
};

// Validate essential config
if (!config.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

export default config;