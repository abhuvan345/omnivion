import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadCSV } from "../controllers/uploadController.js";

const router = express.Router();
router.post("/", verifyToken, authorizeRoles("teacher"), uploadCSV);

export default router;
