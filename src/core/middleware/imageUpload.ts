import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { Request } from 'express';

// Ensure upload directories exist
[config.IMAGE_UPLOAD_DIR, config.THUMBNAIL_UPLOAD_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image file.') as any, false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.IMAGE_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

export const uploadImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: config.MAX_FILE_SIZE }
});