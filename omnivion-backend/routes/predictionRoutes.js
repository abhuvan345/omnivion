import express from "express";
import {
  getPrediction,
  getBatchPredictions,
  checkMLHealth,
} from "../controllers/predictionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All prediction routes require authentication
router.use(verifyToken);

// Health check for ML service (accessible to all authenticated users)
router.get("/health", checkMLHealth);

// Single student prediction (teachers and above)
router.post(
  "/predict",
  authorizeRoles("teacher", "hod", "admin"),
  getPrediction
);

// Batch predictions (teachers and above)
router.post(
  "/predict-batch",
  authorizeRoles("teacher", "hod", "admin"),
  getBatchPredictions
);

export default router;
