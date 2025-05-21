import express from 'express';
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} from '../controllers/contact.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorizeRoles } from '../middlewares/isAdmin.js';

const router = express.Router();

// Public route - không cần đăng nhập
router.post('/', submitContact);

// Admin routes - yêu cầu đăng nhập và quyền admin
router.use(verifyToken);
router.use(authorizeRoles('admin'));

router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.patch('/:id/status', updateContactStatus);
router.delete('/:id', deleteContact);

export default router;
