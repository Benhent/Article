import express from 'express';
import {
  createDiscussion,
  getArticleDiscussions,
  getDiscussionById,
  addMessage,
  markMessagesAsRead,
  addParticipant,
  removeParticipant,
  updateDiscussion,
  deleteDiscussion,
  getAllDiscussions
} from '../../controllers/discussion.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyToken);

// Discussion CRUD routes
router.get('/', getAllDiscussions);
router.post('/', createDiscussion);
router.get('/article/:articleId', getArticleDiscussions);
router.get('/:discussionId', getDiscussionById);
router.put('/:discussionId', updateDiscussion);
router.delete('/:discussionId', deleteDiscussion);

// Message routes
router.post('/:discussionId/messages', addMessage);
router.post('/:discussionId/messages/read', markMessagesAsRead);

// Participant management routes
router.post('/:discussionId/participants', addParticipant);
router.delete('/:discussionId/participants', removeParticipant);

export default router;
