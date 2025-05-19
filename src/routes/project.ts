import { Router } from 'express';
import { createProject, getProjects, getProjectById, createBid, updateBid, deleteBid, selectBid, submitDeliverable, completeProject } from '../controllers/project';
import { authMiddleware } from '../middleware/auth';
import { fileUploadMiddleware } from '../middleware/fileUpload';

const router = Router();

router.post('/create', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.post('/bid', authMiddleware, createBid);
router.put('/bid', authMiddleware, updateBid);
router.delete('/bid', authMiddleware, deleteBid);
router.post('/select-bid', authMiddleware, selectBid);
router.post('/deliver', authMiddleware, fileUploadMiddleware, submitDeliverable); 
router.post('/complete', authMiddleware, completeProject); 

export default router;