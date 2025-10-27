import axios from "axios";

// Local ML service configuration
const ML_API_URL = process.env.PYTHON_API_URL || "http://localhost:5000";

// Helper function to format student data for the local ML model
const formatStudentDataForML = (studentData) => {
  // Create the student data object with proper feature mapping
  // Based on your Student model schema and the feature columns you provided
  const formattedData = {
    student_id: studentData.student_id || studentData._id,
    age: studentData.age || 20,
    cgpa: studentData.cgpa || 0,
    attendance_rate: studentData.attendance_rate || 0,
    family_income: studentData.family_income || 0,
    past_failures: studentData.past_failures || 0,
    study_hours_per_week: studentData.study_hours_per_week || 0,
    assignments_submitted: studentData.assignments_submitted || 0,
    projects_completed: studentData.projects_completed || 0,
    total_activities: studentData.total_activities || 0,
    dropout: studentData.dropout || 0,

    // Encoded categorical features - these should match your encoding scheme
    scholarship_encoded: studentData.scholarship || 0,
    extra_curricular_encoded: studentData.extra_curricular || 0,
    sports_participation_encoded: studentData.sports_participation || 0,
    parental_education_encoded: studentData.parental_education || 0,

    // Gender encoding (one-hot)
    gender_Female: studentData.gender === 0 ? 1 : 0,
    gender_Male: studentData.gender === 1 ? 1 : 0,
    gender_Other: studentData.gender === 2 ? 1 : 0,

    // Department encoding (one-hot)
    department_ARTS: studentData.department === 0 ? 1 : 0,
    department_BIOLOGY: studentData.department === 1 ? 1 : 0,
    department_CIVIL: studentData.department === 2 ? 1 : 0,
    department_COMMERCE: studentData.department === 3 ? 1 : 0,
    "department_COMPUTER SCIENCE": studentData.department === 4 ? 1 : 0,
    department_ELECTRONICS: studentData.department === 5 ? 1 : 0,
    department_MECHANICAL: studentData.department === 6 ? 1 : 0,
  };

  return formattedData;
};

// Get single student dropout prediction
export const getPrediction = async (req, res) => {
  try {
    const studentData = req.body;

    // Format data for the local ML model
    const formattedData = formatStudentDataForML(studentData);

    console.log(
      "🔮 Making dropout prediction for student:",
      formattedData.student_id
    );

    try {
      // Try to call the local ML service
      const response = await axios.post(
        `${ML_API_URL}/predict`,
        formattedData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      // Format response for frontend
      const prediction = response.data;

      const formattedResponse = {
        student_id: prediction.student_id,
        dropout_prediction: {
          risk_level: prediction.risk_level,
          dropout_probability: prediction.dropout_probability,
          confidence: prediction.dropout_probability,
        },
        contributing_factors: prediction.contributing_factors || [],
        recommendations: prediction.recommendations || [],
        model_version: prediction.model_version || "Local ML Model",
        source: "local_ml_service",
        prediction_type: "dropout_risk",
        timestamp: new Date().toISOString(),
      };

      res.json(formattedResponse);
    } catch (mlError) {
      console.log("❌ ML service unavailable, using fallback logic");

      // Fallback prediction logic based on simple rules
      const mockPrediction = generateMockPrediction(studentData);
      res.json(mockPrediction);
    }
  } catch (error) {
    console.error("Dropout prediction error:", error.message);

    res.status(500).json({
      error: "Failed to get dropout prediction",
      details: error.message,
    });
  }
};

// Simple mock prediction function
const generateMockPrediction = (studentData) => {
  // Simple rule-based prediction for demo purposes
  let riskScore = 0;
  const factors = [];

  // CGPA factor
  if (studentData.cgpa < 5.0) {
    riskScore += 0.4;
    factors.push({
      factor: "Low CGPA",
      weight: 0.8,
      description: `CGPA of ${studentData.cgpa || 0} is below average`,
    });
  }

  // Attendance factor
  if (studentData.attendance_rate < 70) {
    riskScore += 0.3;
    factors.push({
      factor: "Poor Attendance",
      weight: 0.7,
      description: `Attendance rate of ${
        studentData.attendance_rate || 0
      }% is concerning`,
    });
  }

  // Past failures factor
  if (studentData.past_failures > 3) {
    riskScore += 0.2;
    factors.push({
      factor: "Multiple Past Failures",
      weight: 0.6,
      description: `${
        studentData.past_failures || 0
      } past failures indicate academic struggles`,
    });
  }

  // Study hours factor
  if (studentData.study_hours_per_week < 10) {
    riskScore += 0.1;
    factors.push({
      factor: "Insufficient Study Time",
      weight: 0.5,
      description: `Only ${
        studentData.study_hours_per_week || 0
      } hours of study per week`,
    });
  }

  riskScore = Math.min(riskScore, 1.0);

  let riskLevel = "low";
  if (riskScore >= 0.7) riskLevel = "high";
  else if (riskScore >= 0.4) riskLevel = "medium";

  // Generate recommendations based on risk level
  const recommendations = [];
  if (riskLevel === "high") {
    recommendations.push({
      action: "Immediate Academic Intervention",
      priority: "high",
      description: "Schedule one-on-one tutoring and academic counseling",
    });
    recommendations.push({
      action: "Attendance Monitoring",
      priority: "high",
      description: "Implement daily attendance tracking",
    });
  } else if (riskLevel === "medium") {
    recommendations.push({
      action: "Study Skills Workshop",
      priority: "medium",
      description: "Enroll in study skills workshops",
    });
    recommendations.push({
      action: "Regular Check-ins",
      priority: "medium",
      description: "Schedule bi-weekly progress meetings",
    });
  } else {
    recommendations.push({
      action: "Maintain Current Progress",
      priority: "low",
      description: "Continue current study habits",
    });
  }

  return {
    student_id: studentData.student_id || studentData._id,
    dropout_prediction: {
      risk_level: riskLevel,
      dropout_probability: riskScore,
      confidence: riskScore,
    },
    contributing_factors: factors,
    recommendations: recommendations,
    model_version: "Fallback Mock Model v1.0",
    source: "fallback_service",
    prediction_type: "dropout_risk",
    timestamp: new Date().toISOString(),
    warning: "Using fallback prediction logic - ML service unavailable",
  };
};

// Get batch dropout predictions for multiple students
export const getBatchPredictions = async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: "Students array is required" });
    }

    console.log(
      `🔮 Making batch dropout predictions for ${students.length} students`
    );

    try {
      // Format all student data for the ML model
      const formattedStudents = students.map((student) =>
        formatStudentDataForML(student)
      );

      // Call the local ML service for batch prediction
      const response = await axios.post(
        `${ML_API_URL}/predict_batch`,
        { students: formattedStudents },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000, // Increased timeout for batch processing
        }
      );

      // Format response for frontend
      const batchPredictions = response.data;

      const formattedResponse = {
        predictions: batchPredictions.predictions.map((prediction) => ({
          student_id: prediction.student_id,
          dropout_prediction: {
            risk_level: prediction.risk_level,
            dropout_probability: prediction.dropout_probability,
            confidence: prediction.dropout_probability,
          },
          contributing_factors: prediction.contributing_factors || [],
          recommendations: prediction.recommendations || [],
          error: prediction.error || null,
        })),
        summary: {
          total: batchPredictions.total_processed || students.length,
          successful: batchPredictions.predictions.filter((p) => !p.error)
            .length,
          failed: batchPredictions.predictions.filter((p) => p.error).length,
          high_risk: batchPredictions.predictions.filter(
            (p) => p.risk_level === "high"
          ).length,
          medium_risk: batchPredictions.predictions.filter(
            (p) => p.risk_level === "medium"
          ).length,
          low_risk: batchPredictions.predictions.filter(
            (p) => p.risk_level === "low"
          ).length,
        },
        model_version: batchPredictions.model_version || "Local ML Model",
        source: "local_ml_service",
        prediction_type: "dropout_risk",
        timestamp: new Date().toISOString(),
      };

      res.json(formattedResponse);
    } catch (mlError) {
      console.log(
        "❌ ML service unavailable, using fallback logic for batch prediction"
      );

      // Fallback: generate mock predictions for all students
      const predictions = students.map((student) =>
        generateMockPrediction(student)
      );

      const formattedResponse = {
        predictions: predictions,
        summary: {
          total: students.length,
          successful: predictions.length,
          failed: 0,
          high_risk: predictions.filter(
            (p) => p.dropout_prediction.risk_level === "high"
          ).length,
          medium_risk: predictions.filter(
            (p) => p.dropout_prediction.risk_level === "medium"
          ).length,
          low_risk: predictions.filter(
            (p) => p.dropout_prediction.risk_level === "low"
          ).length,
        },
        model_version: "Fallback Mock Model v1.0",
        source: "fallback_service",
        prediction_type: "dropout_risk",
        timestamp: new Date().toISOString(),
        warning: "Using fallback prediction logic - ML service unavailable",
      };

      res.json(formattedResponse);
    }
  } catch (error) {
    console.error("Batch dropout prediction error:", error.message);

    res.status(500).json({
      error: "Failed to get batch dropout predictions",
      details: error.message,
    });
  }
};

// Check local ML service health
export const checkMLHealth = async (req, res) => {
  try {
    console.log("🏥 Checking ML service health...");

    const response = await axios.get(`${ML_API_URL}/health`, {
      timeout: 5000,
    });

    res.json({
      status: "connected",
      service: "Local ML Service",
      model_type: "Dropout Prediction Model",
      model_loaded: response.data.model_loaded,
      endpoint: ML_API_URL,
      features_supported: [
        "student_id",
        "age",
        "cgpa",
        "attendance_rate",
        "family_income",
        "past_failures",
        "study_hours_per_week",
        "assignments_submitted",
        "projects_completed",
        "total_activities",
        "dropout",
        "scholarship_encoded",
        "extra_curricular_encoded",
        "sports_participation_encoded",
        "parental_education_encoded",
        "gender_Female",
        "gender_Male",
        "gender_Other",
        "department_ARTS",
        "department_BIOLOGY",
        "department_CIVIL",
        "department_COMMERCE",
        "department_COMPUTER SCIENCE",
        "department_ELECTRONICS",
        "department_MECHANICAL",
      ],
      prediction_types: ["dropout_risk"],
      last_checked: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ML health check error:", error.message);

    res.json({
      status: "disconnected",
      service: "Fallback Service",
      model_type: "Simple Rule-based Prediction",
      model_loaded: true,
      endpoint: "Built-in fallback logic",
      features_supported: [
        "cgpa",
        "attendance_rate",
        "past_failures",
        "study_hours_per_week",
      ],
      prediction_types: ["dropout_risk"],
      warning: "Using fallback prediction logic - ML service unavailable",
      suggestion:
        "Start the Python ML service on port 5000 for improved predictions",
      last_checked: new Date().toISOString(),
    });
  }
};
