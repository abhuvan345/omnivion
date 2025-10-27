import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => res.send("Omnivion backend is running"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
