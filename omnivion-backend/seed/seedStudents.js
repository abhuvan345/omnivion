import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import csv from "csv-parser";
import Student from "../models/Student2.js";
import connectDB from "../utils/connectDB.js";

dotenv.config();

const FILE_PATH = path.resolve("./seed/students.csv");

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

const numeric = (val) => {
  const v = parseFloat(val);
  return isNaN(v) ? null : v;
};

const booleanize = (val) => {
  if (!val) return null;
  const v = val.toString().toLowerCase();
  return ["y", "yes", "true"].includes(v);
};

const seedStudents = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    const students = [];
    fs.createReadStream(FILE_PATH)
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
      })
      .on("end", async () => {
        console.log(`📊 Total records read: ${students.length}`);

        await Student.deleteMany({});
        console.log("🗑️  Old student data cleared");

        // Insert in batches (for large CSV)
        const BATCH_SIZE = 1000;
        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          const batch = students.slice(i, i + BATCH_SIZE);
          await Student.insertMany(batch, { ordered: false });
          console.log(`✅ Inserted ${i + batch.length}/${students.length}`);
        }

        console.log("🎉 Seeding completed successfully!");
        mongoose.connection.close();
      });
  } catch (err) {
    console.error("❌ Error seeding students:", err);
    mongoose.connection.close();
  }
};

seedStudents();
