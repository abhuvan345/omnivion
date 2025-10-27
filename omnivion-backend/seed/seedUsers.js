import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding users");

    // Clear existing users
    await User.deleteMany({});
    console.log("🗑️  Cleared existing users");

    // Create admin
    const admin = new User({
      name: "Admin User",
      email: "admin@omnivion.local",
      password: "Admin123!",
      role: "admin",
    });
    await admin.save();
    console.log("✅ Created Admin user");

    // Create HODs for different departments
    const departments = [
      "Arts",
      "Bio",
      "Civil",
      "Commerce",
      "ECE",
      "CS",
      "Mech",
    ];

    for (const dept of departments) {
      const hod = new User({
        name: `HOD ${dept}`,
        email: `hod-${dept.toLowerCase()}@omnivion.local`,
        password: `HOD${dept}123!`,
        role: "hod",
        department: dept,
      });
      await hod.save();
      console.log(`✅ Created HOD for ${dept}`);
    }

    // Create teachers for each department (5 per department)
    for (const dept of departments) {
      for (let i = 1; i <= 5; i++) {
        const teacher = new User({
          name: `Teacher ${dept} ${i}`,
          email: `teacher-${dept.toLowerCase()}-${i}@omnivion.local`,
          password: `Teacher${dept}${i}123!`,
          role: "teacher",
          department: dept,
        });
        await teacher.save();
      }
      console.log(`✅ Created 5 teachers for ${dept}`);
    }

    console.log("🎉 User seeding completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log("  Email: admin@omnivion.local");
    console.log("  Password: Admin123!");
    console.log("\nHOD (example for CS department):");
    console.log("  Email: hod-cs@omnivion.local");
    console.log("  Password: HODCS123!");
    console.log("\nTeacher (example for CS department):");
    console.log("  Email: teacher-cs-1@omnivion.local");
    console.log("  Password: TeacherCS1123!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();
