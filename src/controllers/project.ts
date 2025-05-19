import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createProject = async (req: AuthRequest, res: Response) => {
  const { title, description, budgetMin, budgetMax, deadline } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
     res.status(401).json({ error: 'Unauthorized' });
     return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'BUYER') {
     res.status(403).json({ error: 'Only buyers can create projects' });
     return
  }

  if (!title || !description || !budgetMin || !budgetMax || !deadline) {
    res.status(400).json({ error: 'All fields are required' });
    return 
  }

  if (budgetMin < 0 || budgetMax < budgetMin) {
     res.status(400).json({ error: 'Invalid budget range' });
     return
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
     res.status(400).json({ error: 'Deadline must be a valid date in the future' });
     return
  }

  try {
    const project = await prisma.project.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
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
       return
    }

    res.json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createBid = async (req: AuthRequest, res: Response) => {
  const { projectId, amount, message } = req.body;
  const sellerId = req.user?.userId;

  if (!sellerId) {
     res.status(401).json({ error: 'Unauthorized' });
     return
  }

  const user = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!user || user.role !== 'SELLER') {
     res.status(403).json({ error: 'Only sellers can place bids' });
     return
  }

  if (!projectId || !amount) {
     res.status(400).json({ error: 'Project ID and amount are required' });
     return
  }

  if (amount <= 0) {
     res.status(400).json({ error: 'Bid amount must be greater than 0' });
     return
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) {
     res.status(404).json({ error: 'Project not found' });
     return
  }
  if (new Date(project.deadline) < new Date()) {
     res.status(400).json({ error: 'Project bidding deadline has passed' });
     return
  }

  try {
    const bid = await prisma.bid.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
};

export const updateBid = async (req: AuthRequest, res: Response) => {
  const { bidId, amount, message } = req.body;
  const sellerId = req.user?.userId;

  if (!sellerId) {
     res.status(401).json({ error: 'Unauthorized' });
     return
  }

  if (!bidId || !amount) {
     res.status(400).json({ error: 'Bid ID and amount are required' });
     return
  }

  if (amount <= 0) {
     res.status(400).json({ error: 'Bid amount must be greater than 0' });
     return
  }

  try {
    // Check if the bid exists and belongs to the seller
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { project: true },
    });

    if (!bid) {
       res.status(404).json({ error: 'Bid not found' });
       return
    }

    if (bid.sellerId !== sellerId) {
       res.status(403).json({ error: 'You can only edit your own bids' });
       return
    }

    // Check if the project's bidding deadline has passed
    if (new Date(bid.project.deadline) < new Date()) {
       res.status(400).json({ error: 'Project bidding deadline has passed' });
       return
    }

    // Update the bid
    const updatedBid = await prisma.bid.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update bid' });
  }
};

export const deleteBid = async (req: AuthRequest, res: Response) => {
  const { bidId } = req.body;
  const sellerId = req.user?.userId;

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
    const bid = await prisma.bid.findUnique({
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
    await prisma.bid.delete({
      where: { id: bidId },
    });

    res.json({ message: 'Bid deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete bid' });
  }
};