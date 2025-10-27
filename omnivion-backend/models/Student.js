import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  name: { type: String },
  gender: String,
  department: String,
  scholarship: String,
  parental_education: String,
  extra_curricular: String,
  age: Number,
  cgpa: Number,
  attendance_rate: Number,
  family_income: Number,
  past_failures: Number,
  study_hours_per_week: Number,
  assignments_submitted: Number,
  projects_completed: Number,
  total_activities: Number,
  sports_participation: String,
  dropout: { type: Number, default: 0 }, // historical label if any
  // predicted risk / last analyzed
  last_prediction: {
    risk_score: Number,
    predicted_at: Date
  }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
