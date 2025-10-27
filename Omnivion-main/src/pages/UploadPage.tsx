import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Users,
} from "lucide-react";

interface PredictionResult {
  student_id: string;
  risk_level: "high" | "medium" | "low" | "unknown";
  dropout_probability: number;
  contributing_factors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: string;
    description: string;
  }>;
  error?: string;
}

interface UploadResult {
  message: string;
  studentsProcessed: number;
  predictionsGenerated: number;
  predictions: PredictionResult[];
  mlServiceStatus: string;
}

export default function UploadPage() {
  const { profile, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  // Block access if user is not a teacher
  if (!loading && profile?.role !== "teacher") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Access Denied
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Uploading student CSV files is restricted to Class Teachers. If you
          believe this is an error, contact an administrator.
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setError("");
        setUploadResult(null);
      } else {
        setError("Please upload a CSV file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const result = (await api.uploadStudentData(file)) as UploadResult;
      setUploadResult(result);
      setFile(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "low":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return <TrendingUp className="w-4 h-4" />;
      case "medium":
        return <Minus className="w-4 h-4" />;
      case "low":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const riskStats = uploadResult?.predictions
    ? {
        high: uploadResult.predictions.filter((p) => p.risk_level === "high")
          .length,
        medium: uploadResult.predictions.filter(
          (p) => p.risk_level === "medium"
        ).length,
        low: uploadResult.predictions.filter((p) => p.risk_level === "low")
          .length,
        unknown: uploadResult.predictions.filter(
          (p) => p.risk_level === "unknown"
        ).length,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Student Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Upload CSV files to analyze student data and generate dropout
          predictions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                file
                  ? "border-[#00CFFF] bg-[#00CFFF]/5"
                  : "border-gray-300 dark:border-gray-700 hover:border-[#00CFFF] hover:bg-[#00CFFF]/5"
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-[#4B0082] to-[#00CFFF]">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {file ? file.name : "Choose a CSV file or drag it here"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Maximum file size: 10MB
                    </p>
                  </div>
                  {!file && (
                    <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#4B0082] to-[#00CFFF] text-white font-semibold hover:shadow-lg hover:shadow-[#00CFFF]/50 transition-all duration-300">
                      Select File
                    </button>
                  )}
                </div>
              </label>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {uploadResult && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-green-600 dark:text-green-400">
                  {uploadResult.message}
                </p>
              </div>
            )}

            {file && !uploadResult && (
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#4B0082] to-[#00CFFF] text-white font-semibold hover:shadow-lg hover:shadow-[#00CFFF]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Processing..." : "Upload and Analyze"}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setError("");
                  }}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Upload Results Summary */}
          {uploadResult && (
            <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Processing Results
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      Total
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {uploadResult.studentsProcessed}
                  </span>
                </div>

                {riskStats && (
                  <>
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          High Risk
                        </span>
                      </div>
                      <span className="text-xl font-bold text-red-900 dark:text-red-100">
                        {riskStats.high}
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Minus className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                          Medium Risk
                        </span>
                      </div>
                      <span className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                        {riskStats.medium}
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Low Risk
                        </span>
                      </div>
                      <span className="text-xl font-bold text-green-900 dark:text-green-100">
                        {riskStats.low}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {uploadResult.mlServiceStatus === "unavailable" && (
                <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    ML prediction service is unavailable. Students saved but
                    predictions are not available.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Predictions List */}
          {uploadResult?.predictions && uploadResult.predictions.length > 0 && (
            <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Student Risk Predictions
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadResult.predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getRiskColor(
                      prediction.risk_level
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(prediction.risk_level)}
                        <span className="font-semibold">
                          Student ID: {prediction.student_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(prediction.dropout_probability * 100).toFixed(1)}%
                          risk
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full uppercase`}
                        >
                          {prediction.risk_level}
                        </span>
                      </div>
                    </div>

                    {prediction.error && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Error: {prediction.error}
                      </p>
                    )}

                    {prediction.contributing_factors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">
                          Key Factors:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.contributing_factors
                            .slice(0, 3)
                            .map((factor, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                title={factor.description}
                              >
                                {factor.factor}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-5 h-5 text-[#00CFFF]" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                CSV Format
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your CSV file should include the following columns:
            </p>
            <ul className="space-y-2 text-sm">
              {[
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
                "scholarship_encoded",
                "extra_curricular_encoded",
                "sports_participation_encoded",
                "parental_education_encoded",
              ].map((col) => (
                <li key={col} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF]" />
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {col}
                  </code>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#4B0082]/10 to-[#00CFFF]/10 dark:from-[#4B0082]/20 dark:to-[#00CFFF]/20 rounded-2xl p-6 border border-[#00CFFF]/30">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
              AI Prediction Model
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our XGBoost machine learning model analyzes multiple factors
              including academic performance, attendance, family background, and
              engagement metrics to predict dropout risk and provide actionable
              recommendations for intervention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
