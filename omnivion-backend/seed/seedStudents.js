import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import csv from "csv-parser";
import Student from "../models/Student.js";
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
          gender: cleanValue(row.gender),
          department: cleanValue(row.department),
          scholarship: cleanValue(row.scholarship),
          parental_education: cleanValue(row.parental_education),
          extra_curricular: cleanValue(row.extra_curricular),
          age: numeric(row.age),
          cgpa: numeric(row.cgpa),
          attendance_rate: numeric(row.attendance_rate),
          family_income: numeric(row.family_income),
          past_failures: numeric(row.past_failures),
          study_hours_per_week: numeric(row.study_hours_per_week),
          assignments_submitted: numeric(row.assignments_submitted),
          projects_completed: numeric(row.projects_completed),
          total_activities: numeric(row.total_activities),
          sports_participation: cleanValue(row.sports_participation),
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
