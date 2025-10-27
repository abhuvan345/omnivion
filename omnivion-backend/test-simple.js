// Simple test without authentication to check fallback logic
import axios from "axios";

async function testSimple() {
  console.log("🧪 Testing Server Response...\n");

  try {
    // Try to access a non-auth endpoint
    const response = await axios.get("http://localhost:8000/");
    console.log("✅ Server is running");
  } catch (error) {
    console.log("❌ Server connection failed:", error.message);
    return;
  }

  // Check what happens when we try the prediction endpoint without auth
  try {
    const response = await axios.post(
      "http://localhost:8000/api/predictions/predict",
      {
        student_id: "test",
        cgpa: 3.0,
      }
    );
    console.log("Response:", response.data);
  } catch (error) {
    console.log(
      "Expected auth error:",
      error.response?.status,
      error.response?.data?.message
    );
  }

  // Test health endpoint without auth
  try {
    const response = await axios.get(
      "http://localhost:8000/api/predictions/health"
    );
    console.log("Health response:", response.data);
  } catch (error) {
    console.log(
      "Health check error:",
      error.response?.status,
      error.response?.data?.message
    );
  }
}

testSimple();
