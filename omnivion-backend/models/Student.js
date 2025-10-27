import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true },
    name: { type: String },
    gender: Number, // 0=Female, 1=Male, 2=Other
    department: Number, // 0=ARTS, 1=BIOLOGY, 2=CIVIL, 3=COMMERCE, 4=COMPUTER SCIENCE, 5=ELECTRONICS, 6=MECHANICAL
    scholarship: Number, // 0=No, 1=Partial, 2=Yes
    parental_education: Number, // Encoded value
    extra_curricular: Number, // Encoded value
    age: Number,
    cgpa: Number,
    attendance_rate: Number,
    family_income: Number,
    past_failures: Number,
    study_hours_per_week: Number,
    assignments_submitted: Number,
    projects_completed: Number,
    total_activities: Number,
    sports_participation: Number, // Encoded value
    dropout: { type: Number, default: 0 }, // historical label if any
    // predicted risk / last analyzed
    last_prediction: {
      risk_score: Number,
      predicted_at: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
