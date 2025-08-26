import multer from 'multer';
import { config } from '../config';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/zip',
]);

// Multer storage in memory: OK for small files (≤ 2 MB)
const storage = multer.memoryStorage();

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error(`Unsupported MIME type: ${file.mimetype}`));
  }
  
  cb(null, true);
}

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: config.MAX_UPLOAD_MB * 1024 * 1024, // 2 MB cap
  },
}).single('file'); // expect form-data field name "file"
