import express from "express";
import {
  register,
  login,
  me,
  getAllUsers,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register); // admin can use this to create users
router.post("/login", login);
router.get("/me", verifyToken, me);
router.get("/users", verifyToken, getAllUsers); // Protected route for admin

export default router;
