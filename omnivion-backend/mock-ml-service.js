// Mock ML service for development when Hugging Face is not available
import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock prediction endpoint that simulates the ML model behavior
app.post("/predict", (req, res) => {
  try {
    console.log("Received prediction request:", req.body);

    // Extract student data
    const studentData = req.body;

    // Simple mock logic: calculate risk based on some basic rules
    const cgpa = studentData.cgpa || 0;
    const attendance = studentData.attendance_rate || 0;
    const studyHours = studentData.study_hours_per_week || 0;

    // Simple heuristic for demo purposes
    let riskScore = 0;

    if (cgpa < 2.5) riskScore += 0.4;
    if (attendance < 0.7) riskScore += 0.3;
    if (studyHours < 10) riskScore += 0.2;

    riskScore = Math.min(riskScore, 1.0); // Cap at 1.0

    const prediction = riskScore > 0.5 ? "High Risk" : "Low Risk";

    const response = {
      prediction: prediction,
      confidence: riskScore,
      risk_score: riskScore,
      factors: {
        cgpa_impact: cgpa < 2.5 ? "negative" : "positive",
        attendance_impact: attendance < 0.7 ? "negative" : "positive",
        study_hours_impact: studyHours < 10 ? "negative" : "positive",
      },
      message:
        "Mock prediction - replace with actual Hugging Face API when available",
    };

    res.json(response);
  } catch (error) {
    console.error("Mock prediction error:", error);
    res
      .status(500)
      .json({ error: "Mock prediction failed", details: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Mock ML Service",
    message: "Development mock - replace with Hugging Face API",
  });
});

// Batch prediction endpoint
app.post("/predict_batch", (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: "Students array is required" });
    }

    const predictions = students.map((student, index) => {
      // Use same logic as single prediction
      const cgpa = student.cgpa || 0;
      const attendance = student.attendance_rate || 0;
      const studyHours = student.study_hours_per_week || 0;

      let riskScore = 0;
      if (cgpa < 2.5) riskScore += 0.4;
      if (attendance < 0.7) riskScore += 0.3;
      if (studyHours < 10) riskScore += 0.2;
      riskScore = Math.min(riskScore, 1.0);

      return {
        studentId: student.student_id || `student_${index}`,
        prediction: riskScore > 0.5 ? "High Risk" : "Low Risk",
        confidence: riskScore,
        risk_score: riskScore,
      };
    });

    res.json({
      predictions: predictions,
      total: students.length,
      message:
        "Mock batch prediction - replace with Hugging Face API when available",
    });
  } catch (error) {
    console.error("Mock batch prediction error:", error);
    res
      .status(500)
      .json({ error: "Mock batch prediction failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mock ML Service running on http://localhost:${PORT}`);
  console.log("📝 This is a development mock service");
  console.log(
    "🔄 Replace with actual Hugging Face API when it becomes available"
  );
});

export default app;
