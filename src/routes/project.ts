import { Router } from 'express';
import { createProject, getProjects, getProjectById, createBid, updateBid, deleteBid, selectBid } from '../controllers/project';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/create', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.post('/bid', authMiddleware, createBid);
router.put('/bid', authMiddleware, updateBid);
router.delete('/bid', authMiddleware, deleteBid);
router.post('/select-bid', authMiddleware, selectBid); // Add select bid endpoint

export default router;