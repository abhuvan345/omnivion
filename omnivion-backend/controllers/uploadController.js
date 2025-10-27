import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import path from "path";
import Student from "../models/Student.js";

const upload = multer({ dest: "uploads/" });

// Helper functions for data conversion (same as in seedStudents.js)
const numeric = (val) => {
  const v = parseFloat(val);
  return isNaN(v) ? null : v;
};

const cleanValue = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      trimmed === "" ||
      trimmed.toLowerCase() === "na" ||
      trimmed.toLowerCase() === "nan" ||
      trimmed === "-" ||
      trimmed === "None" ||
      trimmed === "NAN"
    )
      return null;
    return trimmed;
  }
  return val;
};

// Convert one-hot encoded gender to numerical code
const getGenderCode = (row) => {
  if (parseFloat(row.gender_Female) === 1) return 0; // Female = 0
  if (parseFloat(row.gender_Male) === 1) return 1; // Male = 1
  if (parseFloat(row.gender_Other) === 1) return 2; // Other = 2
  return null;
};

// Convert one-hot encoded department to numerical code
const getDepartmentCode = (row) => {
  if (parseFloat(row.department_ARTS) === 1) return 0;
  if (parseFloat(row.department_BIOLOGY) === 1) return 1;
  if (parseFloat(row.department_CIVIL) === 1) return 2;
  if (parseFloat(row.department_COMMERCE) === 1) return 3;
  if (parseFloat(row["department_COMPUTER SCIENCE"]) === 1) return 4;
  if (parseFloat(row.department_ELECTRONICS) === 1) return 5;
  if (parseFloat(row.department_MECHANICAL) === 1) return 6;
  return null;
};

// Convert scholarship encoding to numerical code
const getScholarshipCode = (row) => {
  if (parseFloat(row.scholarship_encoded) === 0) return 0; // No scholarship
  if (parseFloat(row.scholarship_encoded) === 1) return 1; // Partial scholarship
  if (parseFloat(row.scholarship_encoded) === 2) return 2; // Yes scholarship
  return null;
};

export const uploadCSV = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "CSV file required" });

      const filePath = path.resolve(req.file.path);
      const students = [];
      const studentsForPrediction = [];

      // Read and parse CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            const student = {
              student_id: cleanValue(row.student_id),
              gender: getGenderCode(row),
              department: getDepartmentCode(row),
              scholarship: getScholarshipCode(row),
              parental_education: numeric(row.parental_education_encoded),
              extra_curricular: numeric(row.extra_curricular_encoded),
              age: numeric(row.age),
              cgpa: numeric(row.cgpa),
              attendance_rate: numeric(row.attendance_rate),
              family_income: numeric(row.family_income),
              past_failures: numeric(row.past_failures),
              study_hours_per_week: numeric(row.study_hours_per_week),
              assignments_submitted: numeric(row.assignments_submitted),
              projects_completed: numeric(row.projects_completed),
              total_activities: numeric(row.total_activities),
              sports_participation: numeric(row.sports_participation_encoded),
              dropout: numeric(row.dropout),
            };

            students.push(student);
            studentsForPrediction.push(student);
          })
          .on("end", resolve)
          .on("error", reject);
      });

      console.log(`📊 Parsed ${students.length} students from CSV`);

      // Save students to database
      try {
        await Student.insertMany(students, { ordered: false });
        console.log(`✅ Saved ${students.length} students to database`);
      } catch (dbError) {
        console.error("Database save error:", dbError.message);
        // Continue with predictions even if some students fail to save
      }

      // Get predictions from ML service
      let predictions = [];
      try {
        const ML_API_URL =
          process.env.PYTHON_API_URL || "http://localhost:5000";
        const response = await axios.post(
          `${ML_API_URL}/predict_batch`,
          { students: studentsForPrediction },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 120000, // 2 minutes timeout for large batches
          }
        );

        predictions = response.data.predictions;
        console.log(`🤖 Generated ${predictions.length} predictions`);
      } catch (mlError) {
        console.error("ML prediction error:", mlError.message);
        // Return the uploaded students even if predictions fail
        predictions = students.map((student) => ({
          student_id: student.student_id,
          risk_level: "unknown",
          dropout_probability: 0,
          contributing_factors: [],
          recommendations: [],
          error: "Prediction service unavailable",
        }));
      }

      // Cleanup uploaded file
      fs.unlinkSync(filePath);

      // Return response with both saved students and predictions
      res.json({
        message: `Successfully processed ${students.length} students`,
        studentsProcessed: students.length,
        predictionsGenerated: predictions.length,
        students: students,
        predictions: predictions,
        mlServiceStatus: predictions[0]?.error ? "unavailable" : "connected",
      });
    } catch (err) {
      console.error("Upload error:", err.message);

      // Cleanup file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        message: "Failed to process CSV file",
        error: err.message,
      });
    }
  },
];
