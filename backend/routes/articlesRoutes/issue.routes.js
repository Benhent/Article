import express from "express";
import {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  publishIssue,
  addArticleToIssue,
  removeArticleFromIssue
} from "../../controllers/issue.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authorizeRoles } from "../../middlewares/isAdmin.js";
import { paginate } from "../../middlewares/pageHelper.js";

const router = express.Router();

// Public routes
router.get("/", paginate, getIssues);
router.get("/:id", getIssueById);

// Protected routes - Editor/Admin only
router.post("/", verifyToken, authorizeRoles("editor", "admin"), createIssue);
router.put("/:id", verifyToken, authorizeRoles("editor", "admin"), updateIssue);
router.delete("/:id", verifyToken, authorizeRoles("editor", "admin"), deleteIssue);
router.post("/:id/publish", verifyToken, authorizeRoles("editor", "admin"), publishIssue);
router.post("/:id/articles", verifyToken, authorizeRoles("editor", "admin"), addArticleToIssue);
router.delete("/:id/articles", verifyToken, authorizeRoles("editor", "admin"), removeArticleFromIssue);

export default router;
