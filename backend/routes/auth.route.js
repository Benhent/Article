import express from 'express';
import {
  signup,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkAuth,
  checkEmailExists,
  changePassword,
  getUsers,
  getUserByEmail
} from '../controllers/auth.controller.js';
import {verifyToken} from '../middlewares/verifyToken.js';
import { authorizeRoles } from '../middlewares/isAdmin.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes - authentication required
router.use(verifyToken); // Apply verifyToken middleware to all routes below
router.post('/logout', logout);
router.get('/check', checkAuth);
router.post('/check-email', checkEmailExists);
router.post('/user-by-email', getUserByEmail);
router.put('/change-password', changePassword);
router.get('/users', authorizeRoles('admin'), getUsers);
export default router;