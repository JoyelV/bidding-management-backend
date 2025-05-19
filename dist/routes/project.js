"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_1 = require("../controllers/project");
const auth_1 = require("../middleware/auth");
const fileUpload_1 = require("../middleware/fileUpload");
const router = (0, express_1.Router)();
router.post('/create', auth_1.authMiddleware, project_1.createProject);
router.get('/', auth_1.authMiddleware, project_1.getProjects);
router.get('/:id', auth_1.authMiddleware, project_1.getProjectById);
router.post('/bid', auth_1.authMiddleware, project_1.createBid);
router.put('/bid', auth_1.authMiddleware, project_1.updateBid);
router.delete('/bid', auth_1.authMiddleware, project_1.deleteBid);
router.post('/select-bid', auth_1.authMiddleware, project_1.selectBid);
router.post('/deliver', auth_1.authMiddleware, fileUpload_1.fileUploadMiddleware, project_1.submitDeliverable); // Add deliverable endpoint
router.post('/complete', auth_1.authMiddleware, project_1.completeProject); // Add complete project endpoint
exports.default = router;
