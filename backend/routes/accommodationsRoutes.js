import express from 'express';
import { accommodationsController } from '../controllers/accommodationsController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (SRS FR-04, FR-05, FR-06)
router.get('/', accommodationsController.getAccommodations);
router.get('/landlord/my', authenticateToken, requireRole('landlord', 'admin'), accommodationsController.getLandlordAccommodations);
router.get('/:id', accommodationsController.getAccommodationById);

// Landlord routes (SRS FR-07, FR-08, FR-09)
router.post('/', authenticateToken, requireRole('landlord', 'admin'), accommodationsController.createAccommodation);
router.patch('/:id', authenticateToken, requireRole('landlord', 'admin'), accommodationsController.updateAccommodation);
router.patch('/:id/status', authenticateToken, requireRole('landlord', 'admin'), accommodationsController.updateStatus);
router.delete('/:id', authenticateToken, requireRole('landlord', 'admin'), accommodationsController.deleteAccommodation);

// Student/User interaction routes (SRS FR-10, FR-13, FR-16, FR-17)
router.post('/:id/viewings', authenticateToken, accommodationsController.requestViewing);
router.post('/:id/reports', authenticateToken, accommodationsController.reportListing);
router.post('/:id/reviews', authenticateToken, accommodationsController.submitReview);
router.post('/:id/save', authenticateToken, accommodationsController.toggleSaveListing);

export default router;
