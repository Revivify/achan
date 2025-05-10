import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import config from '../core/config';

export interface ProcessedImageResult {
    imageFilenameStored: string;
    thumbnailFilenameStored: string;
    imageMimetype: string;
    imageFilesizeBytes: number;
    imageWidth: number;
    imageHeight: number;
}

export const processAndStoreImage = async (
    uploadedFile: Express.Multer.File
): Promise<ProcessedImageResult> => {
    const { filename: storedFilename, path: tempPath, mimetype, size } = uploadedFile;

    // Generate thumbnail
    const thumbnailFilename = `thumb_${storedFilename}`;
    const thumbnailPath = path.join(config.THUMBNAIL_UPLOAD_DIR, thumbnailFilename);

    const image = sharp(tempPath);
    const metadata = await image.metadata();

    await image
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .toFile(thumbnailPath);

    return {
        imageFilenameStored: storedFilename,
        thumbnailFilenameStored: thumbnailFilename,
        imageMimetype: mimetype,
        imageFilesizeBytes: size,
        imageWidth: metadata.width || 0,
        imageHeight: metadata.height || 0,
    };
};

export const deleteImageFiles = async (imageFilename?: string | null, thumbnailFilename?: string | null) => {
    try {
        if (imageFilename) {
            await fs.unlink(path.join(config.IMAGE_UPLOAD_DIR, imageFilename));
        }
        if (thumbnailFilename) {
            await fs.unlink(path.join(config.THUMBNAIL_UPLOAD_DIR, thumbnailFilename));
        }
    } catch (error) {
        // Log error, but don't let it break the main operation (e.g., post deletion)
        console.error("Error deleting image files:", error);
    }
};