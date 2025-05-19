"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProject = exports.submitDeliverable = exports.selectBid = exports.deleteBid = exports.updateBid = exports.createBid = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const email_1 = require("../utils/email");
const cloudinary_1 = require("../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description, budgetMin, budgetMax, deadline } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'BUYER') {
        res.status(403).json({ error: 'Only buyers can create projects' });
        return;
    }
    if (!title || !description || !budgetMin || !budgetMax || !deadline) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    if (budgetMin < 0 || budgetMax < budgetMin) {
        res.status(400).json({ error: 'Invalid budget range' });
        return;
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
        res.status(400).json({ error: 'Deadline must be a valid date in the future' });
        return;
    }
    try {
        const project = yield prisma.project.create({
            data: {
                title,
                description,
                budgetMin,
                budgetMax,
                deadline: deadlineDate,
                buyerId: userId,
            },
        });
        res.status(201).json({ project });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
exports.createProject = createProject;
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield prisma.project.findMany({
            include: {
                buyer: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ projects });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
exports.getProjects = getProjects;
const getProjectById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const project = yield prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: {
                buyer: {
                    select: { id: true, name: true, email: true },
                },
                bids: {
                    include: {
                        seller: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json({ project });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
exports.getProjectById = getProjectById;
const createBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId, amount, message } = req.body;
    const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const user = yield prisma.user.findUnique({ where: { id: sellerId } });
    if (!user || user.role !== 'SELLER') {
        res.status(403).json({ error: 'Only sellers can place bids' });
        return;
    }
    if (!projectId || !amount) {
        res.status(400).json({ error: 'Project ID and amount are required' });
        return;
    }
    if (amount <= 0) {
        res.status(400).json({ error: 'Bid amount must be greater than 0' });
        return;
    }
    const project = yield prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    if (new Date(project.deadline) < new Date()) {
        res.status(400).json({ error: 'Project bidding deadline has passed' });
        return;
    }
    try {
        const bid = yield prisma.bid.create({
            data: {
                amount,
                message: message || '',
                projectId,
                sellerId,
            },
            include: {
                seller: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        res.status(201).json({ bid });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to place bid' });
    }
});
exports.createBid = createBid;
const updateBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { bidId, amount, message } = req.body;
    const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!bidId || !amount) {
        res.status(400).json({ error: 'Bid ID and amount are required' });
        return;
    }
    if (amount <= 0) {
        res.status(400).json({ error: 'Bid amount must be greater than 0' });
        return;
    }
    try {
        // Check if the bid exists and belongs to the seller
        const bid = yield prisma.bid.findUnique({
            where: { id: bidId },
            include: { project: true },
        });
        if (!bid) {
            res.status(404).json({ error: 'Bid not found' });
            return;
        }
        if (bid.sellerId !== sellerId) {
            res.status(403).json({ error: 'You can only edit your own bids' });
            return;
        }
        // Check if the project's bidding deadline has passed
        if (new Date(bid.project.deadline) < new Date()) {
            res.status(400).json({ error: 'Project bidding deadline has passed' });
            return;
        }
        // Update the bid
        const updatedBid = yield prisma.bid.update({
            where: { id: bidId },
            data: {
                amount,
                message: message || bid.message, // Keep existing message if not provided
            },
            include: {
                seller: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        res.json({ bid: updatedBid });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update bid' });
    }
});
exports.updateBid = updateBid;
const deleteBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { bidId } = req.body;
    const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!bidId) {
        res.status(400).json({ error: 'Bid ID is required' });
        return;
    }
    try {
        // Check if the bid exists and belongs to the seller
        const bid = yield prisma.bid.findUnique({
            where: { id: bidId },
            include: { project: true },
        });
        if (!bid) {
            res.status(404).json({ error: 'Bid not found' });
            return;
        }
        if (bid.sellerId !== sellerId) {
            res.status(403).json({ error: 'You can only delete your own bids' });
            return;
        }
        // Check if the project's bidding deadline has passed
        if (new Date(bid.project.deadline) < new Date()) {
            res.status(400).json({ error: 'Project bidding deadline has passed' });
            return;
        }
        // Delete the bid
        yield prisma.bid.delete({
            where: { id: bidId },
        });
        res.json({ message: 'Bid deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete bid' });
    }
});
exports.deleteBid = deleteBid;
const selectBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId, bidId } = req.body;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!buyerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!projectId || !bidId) {
        res.status(400).json({ error: 'Project ID and Bid ID are required' });
        return;
    }
    try {
        // Check if the user is a BUYER
        const user = yield prisma.user.findUnique({ where: { id: buyerId } });
        if (!user || user.role !== 'BUYER') {
            res.status(403).json({ error: 'Only buyers can select bids' });
            return;
        }
        // Check if the project exists and belongs to the buyer
        const project = yield prisma.project.findUnique({
            where: { id: projectId },
            include: { bids: true },
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        if (project.buyerId !== buyerId) {
            res.status(403).json({ error: 'You can only select bids for your own projects' });
            return;
        }
        // Check if the project is still open
        if (project.status !== 'OPEN') {
            res.status(400).json({ error: 'Project is not open for bid selection' });
            return;
        }
        // Check if the bid exists and belongs to the project
        const bid = yield prisma.bid.findUnique({
            where: { id: bidId },
            include: { seller: true },
        });
        if (!bid || bid.projectId !== projectId) {
            res.status(404).json({ error: 'Bid not found or does not belong to this project' });
            return;
        }
        // Update the project status and selected bid
        const updatedProject = yield prisma.project.update({
            where: { id: projectId },
            data: {
                status: 'ASSIGNED',
                selectedBidId: bidId,
            },
            include: {
                buyer: { select: { id: true, name: true, email: true } },
                selectedBid: {
                    include: { seller: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        // Send email notification to the selected seller
        const emailSubject = `You've been selected for the project: ${project.title}`;
        const emailText = `Dear ${bid.seller.name},\n\nCongratulations! Your bid of $${bid.amount} has been selected for the project "${project.title}" by ${user.name} (${user.email}).\n\nPlease get in touch with the buyer to proceed.\n\nBest regards,\nBidding System Team`;
        yield (0, email_1.sendEmail)(bid.seller.email, emailSubject, emailText);
        res.json({ project: updatedProject });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to select bid' });
    }
});
exports.selectBid = selectBid;
const submitDeliverable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId } = req.body;
    const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const filePath = req.filePath;
    if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!projectId || !filePath) {
        res.status(400).json({ error: 'Project ID and file are required' });
        return;
    }
    // Type guard to ensure filePath is a string
    if (typeof filePath !== 'string') {
        res.status(500).json({ error: 'File path is invalid' });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: sellerId } });
        if (!user || user.role !== 'SELLER') {
            res.status(403).json({ error: 'Only sellers can submit deliverables' });
            return;
        }
        // Add type checking for projectId
        const parsedProjectId = typeof projectId === 'string' || typeof projectId === 'number' ? parseInt(projectId) : null;
        if (!parsedProjectId || isNaN(parsedProjectId)) {
            fs_1.default.unlinkSync(filePath);
            res.status(400).json({ error: 'Invalid Project ID' });
            return;
        }
        const project = yield prisma.project.findUnique({
            where: { id: parsedProjectId },
            include: { selectedBid: true },
        });
        if (!project) {
            fs_1.default.unlinkSync(filePath);
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        if (project.status !== 'ASSIGNED') {
            fs_1.default.unlinkSync(filePath);
            res.status(400).json({ error: 'Project is not in ASSIGNED status' });
            return;
        }
        if (!project.selectedBid || project.selectedBid.sellerId !== sellerId) {
            fs_1.default.unlinkSync(filePath);
            res.status(403).json({ error: 'You are not the selected seller for this project' });
            return;
        }
        const fileUrl = yield (0, cloudinary_1.uploadFile)(filePath, 'project-deliverables');
        fs_1.default.unlinkSync(filePath);
        const deliverable = yield prisma.deliverable.create({
            data: {
                fileUrl,
                projectId: project.id,
                sellerId,
            },
            include: {
                seller: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({ deliverable });
    }
    catch (error) {
        if (filePath)
            fs_1.default.unlinkSync(filePath);
        console.error(error);
        res.status(500).json({ error: 'Failed to submit deliverable' });
    }
});
exports.submitDeliverable = submitDeliverable;
const completeProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId } = req.body;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!buyerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!projectId) {
        res.status(400).json({ error: 'Project ID is required' });
        return;
    }
    // Ensure projectId is a string or number and convert it to a number
    const parsedProjectId = typeof projectId === 'string' || typeof projectId === 'number' ? parseInt(projectId) : null;
    if (!parsedProjectId || isNaN(parsedProjectId)) {
        res.status(400).json({ error: 'Invalid Project ID' });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: buyerId } });
        if (!user || user.role !== 'BUYER') {
            res.status(403).json({ error: 'Only buyers can mark projects as completed' });
            return;
        }
        const project = yield prisma.project.findUnique({
            where: { id: parsedProjectId },
            include: {
                buyer: true,
                selectedBid: { include: { seller: true } },
                deliverables: true,
            },
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        if (project.buyerId !== buyerId) {
            res.status(403).json({ error: 'You can only complete your own projects' });
            return;
        }
        if (project.status !== 'ASSIGNED') {
            res.status(400).json({ error: 'Project is not in ASSIGNED status' });
            return;
        }
        if (project.deliverables.length === 0) {
            res.status(400).json({ error: 'Cannot complete project without deliverables' });
            return;
        }
        // Ensure selectedBid and seller exist before sending email
        if (!project.selectedBid || !project.selectedBid.seller) {
            res.status(400).json({ error: 'No selected bid or seller found for this project' });
            return;
        }
        const updatedProject = yield prisma.project.update({
            where: { id: project.id },
            data: { status: 'COMPLETED' },
            include: {
                buyer: { select: { id: true, name: true, email: true } },
                selectedBid: { include: { seller: { select: { id: true, name: true, email: true } } } },
            },
        });
        // Notify seller
        const sellerEmailSubject = `Project Completed: ${project.title}`;
        const sellerEmailText = `Dear ${project.selectedBid.seller.name},\n\nThe project "${project.title}" has been marked as completed by ${user.name} (${user.email}).\n\nThank you for your work!\n\nBest regards,\nBidding System Team`;
        yield (0, email_1.sendEmail)(project.selectedBid.seller.email, sellerEmailSubject, sellerEmailText);
        // Notify buyer
        const buyerEmailSubject = `Project Completed: ${project.title}`;
        const buyerEmailText = `Dear ${user.name},\n\nYou have successfully marked the project "${project.title}" as completed.\n\nThank you for using our platform!\n\nBest regards,\nBidding System Team`;
        yield (0, email_1.sendEmail)(user.email, buyerEmailSubject, buyerEmailText);
        res.json({ project: updatedProject });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to complete project' });
    }
});
exports.completeProject = completeProject;
