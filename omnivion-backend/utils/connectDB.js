import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️  Server will continue running without database connection");
    console.log("📋 Please check:");
    console.log("   1. MongoDB Atlas IP whitelist includes your current IP");
    console.log("   2. Database credentials are correct");
    console.log("   3. Internet connection is stable");
  }
};

export default connectDB;
