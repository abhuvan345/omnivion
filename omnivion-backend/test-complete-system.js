// Test the complete prediction system with authentication
import axios from "axios";

const BACKEND_URL = "http://localhost:8000"; // Your backend port

// Test credentials (these should exist in your system or be created)
const TEST_USER = {
  email: "test@teacher.com",
  password: "password123",
};

let authToken = null;

async function login() {
  console.log("🔐 Logging in to get authentication token...");
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      TEST_USER
    );
    authToken = response.data.token;
    console.log("✅ Login successful, role:", response.data.role);
    return true;
  } catch (error) {
    console.log(
      "❌ Login failed:",
      error.response?.data?.message || error.message
    );
    console.log("ℹ️  You may need to create a test user first");
    return false;
  }
}

async function createTestUser() {
  console.log("👤 Creating test user...");
  try {
    const newUser = {
      name: "Test Teacher",
      email: "test@teacher.com",
      password: "password123",
      role: "teacher",
      department: "Computer Science",
    };

    await axios.post(`${BACKEND_URL}/api/auth/register`, newUser);
    console.log("✅ Test user created successfully");
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes("already registered")) {
      console.log("ℹ️  Test user already exists");
      return true;
    }
    console.log(
      "❌ Failed to create test user:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function testPredictionSystem() {
  console.log("🧪 Testing Complete Prediction System Integration\n");

  // Step 0: Create test user if needed
  await createTestUser();

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("💥 Cannot proceed without authentication");
    return;
  }

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  // Test 1: Health Check
  console.log("\n1️⃣ Testing Health Check...");
  try {
    const healthResponse = await axios.get(
      `${BACKEND_URL}/api/predictions/health`,
      { headers }
    );
    console.log(
      "✅ Health Check Response:",
      JSON.stringify(healthResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ Health Check Failed:",
      error.response?.data || error.message
    );
  }

  // Test 2: Single Student Prediction
  console.log("\n2️⃣ Testing Single Student Prediction...");
  const sampleStudent = {
    student_id: "test_001",
    name: "Test Student",
    cgpa: 3.2,
    attendance_rate: 0.8,
    study_hours_per_week: 25,
    extra_curricular: 2,
    past_failures: 1,
    family_income: 50000,
    parental_education: 3,
    assignments_submitted: 18,
    age: 20,
    department: 4,
  };

  try {
    const predictionResponse = await axios.post(
      `${BACKEND_URL}/api/predictions/predict`,
      sampleStudent,
      { headers }
    );
    console.log(
      "✅ Single Prediction Response:",
      JSON.stringify(predictionResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ Single Prediction Failed:",
      error.response?.data || error.message
    );
  }

  // Test 3: Batch Prediction
  console.log("\n3️⃣ Testing Batch Prediction...");
  const sampleStudents = [
    { ...sampleStudent, student_id: "test_001", cgpa: 3.5 },
    {
      ...sampleStudent,
      student_id: "test_002",
      cgpa: 2.1,
      attendance_rate: 0.6,
    },
    {
      ...sampleStudent,
      student_id: "test_003",
      cgpa: 3.8,
      study_hours_per_week: 30,
    },
  ];

  try {
    const batchResponse = await axios.post(
      `${BACKEND_URL}/api/predictions/predict-batch`,
      { students: sampleStudents },
      { headers }
    );
    console.log(
      "✅ Batch Prediction Response:",
      JSON.stringify(batchResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ Batch Prediction Failed:",
      error.response?.data || error.message
    );
  }

  console.log("\n🎉 Testing Complete!");
  console.log("\n📋 Summary:");
  console.log("- Hugging Face API will be attempted first");
  console.log("- Mock service will be used as fallback");
  console.log(
    "- Check the source field in responses to see which service was used"
  );
}

testPredictionSystem();
