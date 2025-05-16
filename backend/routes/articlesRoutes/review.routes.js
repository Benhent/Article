import express from 'express';
import {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  acceptReview,
  declineReview,
  completeReview,
  sendReminder,
  createMultipleReviews
} from '../../controllers/review.controller.js';
import {verifyToken} from '../../middlewares/verifyToken.js';
import {authorizeRoles} from '../../middlewares/isAdmin.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, authorizeRoles('admin', 'editor'), createReview);
router.get('/', verifyToken, authorizeRoles('admin', 'editor'), getAllReviews);
router.post('/multiple', verifyToken, authorizeRoles('admin', 'editor'), createMultipleReviews);

// Single review routes
router.get('/:id', verifyToken, authorizeRoles('admin', 'editor', 'reviewer'), getReview);
router.put('/:id', verifyToken, authorizeRoles('admin', 'editor'), updateReview);
router.delete('/:id', verifyToken, authorizeRoles('admin', 'editor'), deleteReview);

// Review actions
router.post('/:id/accept', verifyToken, authorizeRoles('reviewer'), acceptReview);
router.post('/:id/decline', verifyToken, authorizeRoles('reviewer'), declineReview);
router.post('/:id/complete', verifyToken, authorizeRoles('reviewer'), completeReview);
router.post('/:id/reminder', verifyToken, authorizeRoles('admin', 'editor'), sendReminder);

export default router; 