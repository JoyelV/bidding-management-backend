import { Router } from 'express';
import { createProject, getProjects, getProjectById, createBid, updateBid } from '../controllers/project';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/create', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.post('/bid', authMiddleware, createBid);
router.put('/bid', authMiddleware, updateBid); // Add update bid endpoint

export default router;