import express from "express";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  changeArticleStatus,
  assignEditor,
  publishArticle,
  deleteArticle,
  getArticleStats
} from "../../controllers/article.controller.js";
import {verifyToken} from "../../middlewares/verifyToken.js"
import {authorizeRoles} from "../../middlewares/isAdmin.js"
import { paginate } from "../../middlewares/pageHelper.js";

const router = express.Router();

// Public routes
router.get("/", paginate, getArticles);
router.get("/stats", getArticleStats);
router.get("/:id", getArticleById);

// Protected routes
router.post("/", verifyToken, createArticle);
router.delete("/:id", verifyToken, deleteArticle);
router.patch("/:id/status", verifyToken, authorizeRoles("editor", "admin"), changeArticleStatus);
router.put("/:id/assign-editor", verifyToken, authorizeRoles("editor", "admin"), assignEditor);
router.put("/:id/publish", verifyToken, authorizeRoles("editor", "admin"), publishArticle);
router.put("/:id/update", verifyToken, authorizeRoles("editor", "admin"), updateArticle);

export default router;