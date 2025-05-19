import { Response, NextFunction } from 'express';
import formidable from 'formidable';
import fs from 'fs';
import { AuthRequest } from './auth'; // Import AuthRequest

export const fileUploadMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const form = formidable({ multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to parse file upload' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    req.filePath = file.filepath;
    req.body = fields;
    next();
  });
};