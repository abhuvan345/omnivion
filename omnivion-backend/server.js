import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
const app = express();

// CORS configuration: allow frontend origin from env or localhost during development
const configuredOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === configuredOrigin) return callback(null, true);
      if (origin.startsWith("http://localhost")) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/predictions", predictionRoutes);
// app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => res.send("Omnivion backend is running"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
