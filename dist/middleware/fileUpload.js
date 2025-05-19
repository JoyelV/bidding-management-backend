"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadMiddleware = void 0;
const formidable_1 = __importDefault(require("formidable"));
const fileUploadMiddleware = (req, res, next) => {
    const form = (0, formidable_1.default)({ multiples: false });
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
exports.fileUploadMiddleware = fileUploadMiddleware;
