import express from "express";
import { getProfileById, updateProfile } from "../controllers/profile.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";

const router = express.Router();

// Protected routes - authentication required
router.get("/", verifyToken, getProfileById);
router.put("/update-profile", verifyToken, updateProfile); // handleAvatarUpload middleware for avatar upload

export default router;