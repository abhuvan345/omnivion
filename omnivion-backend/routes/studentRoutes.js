import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getAllStudents,
  getDeptStudents,
  getClassStudents,
  createStudent
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin"), getAllStudents);
router.get("/dept", verifyToken, authorizeRoles("hod"), getDeptStudents);
router.get("/class", verifyToken, authorizeRoles("teacher","hod","admin"), getClassStudents);
router.post("/", verifyToken, authorizeRoles("admin"), createStudent);

export default router;
