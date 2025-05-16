import express from 'express';
import {
  createArticleAuthor,
  getAllArticleAuthors,
  getArticleAuthor,
  updateArticleAuthor,
  deleteArticleAuthor,
  getArticleAuthorsByArticle
} from '../../controllers/articleAuthor.controller.js';
import {verifyToken} from '../../middlewares/verifyToken.js';
import {authorizeRoles} from '../../middlewares/isAdmin.js';

const router = express.Router();

// Public routes
router.get('/:articleId/authors', getArticleAuthorsByArticle);


// Protected routes
router.post('/', verifyToken, authorizeRoles('admin', 'editor', 'author'), createArticleAuthor);
router.get('/', verifyToken, getAllArticleAuthors);
router.get('/:id', verifyToken, getArticleAuthor);
router.put('/:id', verifyToken, authorizeRoles('admin', 'editor', 'author'), updateArticleAuthor);
router.delete('/:id', verifyToken, authorizeRoles('admin', 'editor'), deleteArticleAuthor);

export default router; 