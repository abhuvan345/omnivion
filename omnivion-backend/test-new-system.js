// Test the new dropout prediction endpoints
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";
const TEST_USER = {
  email: "test@teacher.com",
  password: "password123",
};

let authToken = null;

async function login() {
  console.log("🔐 Getting fresh authentication token...");
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
    return false;
  }
}

async function testNewPredictionSystem() {
  console.log("🧪 Testing NEW Dropout Prediction System\n");

  // Get fresh token
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
  console.log("\n1️⃣ Testing NEW Health Check...");
  try {
    const healthResponse = await axios.get(
      `${BACKEND_URL}/api/predictions/health`,
      { headers }
    );
    console.log(
      "✅ NEW Health Check Response:",
      JSON.stringify(healthResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ Health Check Failed:",
      error.response?.data || error.message
    );
  }

  // Test 2: Single Student Dropout Prediction
  console.log("\n2️⃣ Testing NEW Single Student Dropout Prediction...");
  const sampleStudent = {
    student_id: "STU001",
    name: "John Doe",
    age: 20,
    cgpa: 6.5,
    attendance_rate: 75,
    family_income: 60000,
    past_failures: 2,
    study_hours_per_week: 15,
    assignments_submitted: 25,
    projects_completed: 3,
    total_activities: 5,
    dropout: 0,
    scholarship: 1,
    extra_curricular: 2,
    sports_participation: 1,
    parental_education: 3,
    gender: 1, // Male
    department: 4, // Computer Science
  };

  try {
    const predictionResponse = await axios.post(
      `${BACKEND_URL}/api/predictions/predict`,
      sampleStudent,
      { headers }
    );
    console.log(
      "✅ NEW Single Prediction Response:",
      JSON.stringify(predictionResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ Single Prediction Failed:",
      error.response?.data || error.message
    );
  }

  // Test 3: High Risk Student
  console.log("\n3️⃣ Testing High Risk Student...");
  const highRiskStudent = {
    student_id: "STU002",
    name: "Jane Smith",
    age: 22,
    cgpa: 3.2, // Low CGPA
    attendance_rate: 45, // Poor attendance
    family_income: 30000,
    past_failures: 5, // Many failures
    study_hours_per_week: 5, // Low study hours
    assignments_submitted: 8, // Few assignments
    projects_completed: 0,
    total_activities: 0,
    dropout: 0,
    scholarship: 0,
    extra_curricular: 0,
    sports_participation: 0,
    parental_education: 1,
    gender: 0, // Female
    department: 2, // Civil
  };

  try {
    const highRiskResponse = await axios.post(
      `${BACKEND_URL}/api/predictions/predict`,
      highRiskStudent,
      { headers }
    );
    console.log(
      "✅ High Risk Prediction Response:",
      JSON.stringify(highRiskResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ High Risk Prediction Failed:",
      error.response?.data || error.message
    );
  }

  // Test 4: Batch Prediction
  console.log("\n4️⃣ Testing NEW Batch Dropout Prediction...");
  const batchStudents = [sampleStudent, highRiskStudent];

  try {
    const batchResponse = await axios.post(
      `${BACKEND_URL}/api/predictions/predict-batch`,
      { students: batchStudents },
      { headers }
    );
    console.log(
      "✅ NEW Batch Prediction Response:",
      JSON.stringify(batchResponse.data, null, 2)
    );
  } catch (error) {
    console.log(
      "❌ Batch Prediction Failed:",
      error.response?.data || error.message
    );
  }

  console.log("\n🎉 NEW Dropout Prediction Testing Complete!");
}

testNewPredictionSystem();
