import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here strictly require admin role (SRS FR-03, FR-14, FR-15, FR-19, FR-20)
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/hostels', adminController.getHostels);
router.patch('/hostels/:id/approve', adminController.approveHostel);
router.patch('/hostels/:id/reject', adminController.rejectHostel);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReport);
router.patch('/listings/:id/moderation', adminController.moderateListing);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.post('/verifications', adminController.recordVerification);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
