import express from 'express';
import { viewingsController } from '../controllers/viewingsController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Landlord gets viewing requests for their properties (SRS FR-11)
router.get('/landlord', authenticateToken, requireRole('landlord', 'admin'), viewingsController.getLandlordViewings);

// Student gets their own viewing requests (SRS FR-10)
router.get('/student', authenticateToken, viewingsController.getStudentViewings);

// Update viewing status (SRS FR-11)
router.patch('/:id', authenticateToken, viewingsController.updateViewingStatus);

export default router;
