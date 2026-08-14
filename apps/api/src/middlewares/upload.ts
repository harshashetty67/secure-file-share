import multer from 'multer';
import { config } from '../config';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/markdown',
  'application/zip',
]);

const ALLOWED_EXTENSIONS = new Set(['.md', '.markdown']);

// Multer storage in memory: OK for small files (≤ 2 MB)
const storage = multer.memoryStorage();

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  if (!ALLOWED_MIME.has(file.mimetype) && !extOk) {
    return cb(new Error(`Unsupported file type: ${file.mimetype || ext || 'unknown'}`));
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
