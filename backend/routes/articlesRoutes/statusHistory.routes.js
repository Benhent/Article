import express from 'express';
import {
  createStatusHistory,
  getAllStatusHistory,
  getStatusHistory,
  updateStatusHistory,
  deleteStatusHistory,
  getStatusHistoryByArticle
} from '../../controllers/statusHistory.controller.js';
import {verifyToken} from '../../middlewares/verifyToken.js';
import {authorizeRoles} from '../../middlewares/isAdmin.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, authorizeRoles('admin', 'editor'), createStatusHistory);
router.get('/', verifyToken, authorizeRoles('admin', 'editor'), getAllStatusHistory);

// Single status history routes
router.get('/:id', verifyToken, authorizeRoles('admin', 'editor'), getStatusHistory);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateStatusHistory);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteStatusHistory);

// Article-specific routes
router.get('/articles/:articleId/status-history', verifyToken, authorizeRoles('admin', 'editor'), getStatusHistoryByArticle);

export default router; 