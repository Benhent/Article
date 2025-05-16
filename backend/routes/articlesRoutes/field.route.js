import express from 'express';
import {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  getChildrenFields,
  getFieldsByLevel,
  getActiveFields,
  toggleFieldStatus
} from '../../controllers/field.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { authorizeRoles } from '../../middlewares/isAdmin.js';

const router = express.Router();

// Public routes
router.use(verifyToken);
router.get('/', getFields);
router.get('/active', getActiveFields);
router.get('/level/:level', getFieldsByLevel);
router.get('/:id', getFieldById);
router.get('/:id/children', getChildrenFields);

// Admin routes
router.use(authorizeRoles('admin'));
router.post('/', createField);
router.put('/:id', updateField);
router.delete('/:id', deleteField);
router.patch('/:id/toggle-status', toggleFieldStatus);

export default router;
