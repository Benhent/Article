import express from "express";
import { 
  uploadArticleFile, 
  getArticleFiles, 
  deleteArticleFile, 
  updateFileStatus,
  getArticleFileContent
} from "../../controllers/articleFile.controller.js";
import {verifyToken} from "../../middlewares/verifyToken.js";
import {authorizeRoles} from "../../middlewares/isAdmin.js";

const router = express.Router();

// Protected routes
router.post("/:articleId", verifyToken, uploadArticleFile);
router.get("/:articleId", verifyToken, getArticleFiles);
router.delete("/:fileId", verifyToken, authorizeRoles('admin', 'editor', 'author'), deleteArticleFile);
router.patch("/:fileId/status", verifyToken, authorizeRoles('admin', 'editor', 'author'), updateFileStatus);
router.get("/:fileId/content", verifyToken, getArticleFileContent);

export default router;