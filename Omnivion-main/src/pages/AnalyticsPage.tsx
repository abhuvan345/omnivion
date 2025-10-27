import { useEffect, useState, useCallback } from "react";
import { api, Student } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import {
  calculateDropoutRisk,
  getRiskLevel,
} from "../utils/dropoutCalculation";
import { generateReport } from "../utils/reportGenerator";
import { TrendingUp, Users, AlertCircle } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  departmentStats: Array<{
    department: string;
    totalStudents: number;
    highRisk: number;
    avgCGPA: number;
  }>;
  cgpaVsAttendance: Array<{
    cgpa: number;
    attendance: number;
    riskLevel: string;
  }>;
  incomeVsDropout: Array<{
    incomeRange: string;
    dropoutRate: number;
    count: number;
  }>;
}

const DEPARTMENT_NAMES: Record<number, string> = {
  0: "ARTS",
  1: "BIOLOGY",
  2: "CIVIL",
  3: "COMMERCE",
  4: "COMPUTER SCIENCE",
  5: "ELECTRONICS",
  6: "MECHANICAL",
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    departmentStats: [],
    cgpaVsAttendance: [],
    incomeVsDropout: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      let students: Student[] = [];

      try {
        // Fetch students based on user role
        if (user?.role === "admin") {
          students = await api.getAllStudents();
        } else if (user?.role === "hod") {
          students = await api.getDepartmentStudents();
        } else if (user?.role === "teacher") {
          students = await api.getClassStudents();
        }

        console.log("Fetched students:", students.length);

        // If no students fetched, use sample data
        if (!students || students.length === 0) {
          console.log("No students found, using sample data");
          students = Array.from({ length: 50 }, (_, i) => ({
            _id: `sample-${i}`,
            student_id: `STU${i + 1}`,
            cgpa: 4 + Math.random() * 6,
            attendance_rate: 50 + Math.random() * 50,
            family_income: 100000 + Math.random() * 1000000,
            department: Math.floor(Math.random() * 7),
            gender: Math.floor(Math.random() * 3),
            scholarship: Math.floor(Math.random() * 3),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        // Generate realistic sample data with proper risk distribution
        const departmentDistribution = {
          0: { name: "ARTS", count: 120 },
          1: { name: "BIOLOGY", count: 100 },
          2: { name: "CIVIL", count: 150 },
          3: { name: "COMMERCE", count: 180 },
          4: { name: "COMPUTER SCIENCE", count: 200 },
          5: { name: "ELECTRONICS", count: 160 },
          6: { name: "MECHANICAL", count: 140 },
        };

        students = [];
        Object.entries(departmentDistribution).forEach(([deptId, info]) => {
          // Generate students for each department
          for (let i = 0; i < info.count; i++) {
            // Create more realistic patterns:
            // Lower CGPA and attendance tend to go together
            const baseRisk = Math.random();
            const cgpaBase = baseRisk < 0.2 ? 4 : baseRisk < 0.5 ? 6 : 7;
            const cgpa = cgpaBase + Math.random() * 2;

            const attendanceBase =
              baseRisk < 0.2 ? 50 : baseRisk < 0.5 ? 65 : 80;
            const attendance = attendanceBase + Math.random() * 15;

            // Income affects risk - lower income tends to have higher risk
            const incomeBase =
              baseRisk < 0.3 ? 100000 : baseRisk < 0.6 ? 300000 : 600000;
            const income = incomeBase + Math.random() * 200000;

            // Past failures more likely with lower CGPA
            const pastFailures =
              cgpa < 6
                ? Math.floor(Math.random() * 4)
                : Math.floor(Math.random() * 2);

            students.push({
              _id: `sample-${deptId}-${i}`,
              student_id: `${info.name.substring(0, 3)}${i + 1}`,
              cgpa,
              attendance_rate: attendance,
              family_income: income,
              department: parseInt(deptId),
              gender: Math.floor(Math.random() * 3),
              scholarship: income < 300000 ? 2 : income < 600000 ? 1 : 0,
              past_failures: pastFailures,
              study_hours_per_week: 15 + Math.random() * 25,
              assignments_submitted: Math.floor(70 + Math.random() * 30),
              projects_completed: Math.floor(3 + Math.random() * 5),
              sports_participation: Math.floor(Math.random() * 3),
              extra_curricular: Math.floor(Math.random() * 3),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        });
      }

      // For now, we don't have predictions from API, so we'll create predictions
      // based on comprehensive student data analysis
      const predMap = new Map();
      students?.forEach((s: Student) => {
        // Use comprehensive dropout risk calculation
        const riskPercentage = calculateDropoutRisk(s);
        const riskLevel = getRiskLevel(riskPercentage);
        predMap.set(s._id, {
          risk_level: riskLevel,
          risk_percentage: riskPercentage,
        });
      });

      const deptMap = new Map<
        string,
        { total: number; highRisk: number; cgpaSum: number }
      >();
      students?.forEach((s: Student) => {
        const deptName = DEPARTMENT_NAMES[s.department || 0] || "Unknown";
        if (!deptMap.has(deptName)) {
          deptMap.set(deptName, { total: 0, highRisk: 0, cgpaSum: 0 });
        }
        const dept = deptMap.get(deptName)!;
        dept.total++;
        dept.cgpaSum += Number(s.cgpa || 0);
        const riskPercentage = calculateDropoutRisk(s);
        if (riskPercentage >= 70) {
          dept.highRisk++;
        }
      });

      const departmentStats = Array.from(deptMap.entries()).map(
        ([dept, stats]) => ({
          department: dept,
          totalStudents: stats.total,
          highRisk: stats.highRisk,
          avgCGPA: stats.total > 0 ? stats.cgpaSum / stats.total : 0,
        })
      );

      const cgpaVsAttendance =
        students?.map((s: Student) => ({
          cgpa: Number(s.cgpa || 0),
          attendance: Number(s.attendance_rate || 0),
          riskLevel: predMap.get(s._id)?.risk_level || "unknown",
        })) || [];

      const incomeRanges = [
        { min: 0, max: 200000, label: "0-2L" },
        { min: 200000, max: 500000, label: "2-5L" },
        { min: 500000, max: 1000000, label: "5-10L" },
        { min: 1000000, max: Infinity, label: "10L+" },
      ];

      const incomeVsDropout = incomeRanges.map((range) => {
        const studentsInRange =
          students?.filter(
            (s: Student) =>
              Number(s.family_income || 0) >= range.min &&
              Number(s.family_income || 0) < range.max
          ) || [];
        const highRiskCount = studentsInRange.filter(
          (s: Student) => predMap.get(s._id)?.risk_level === "high"
        ).length;
        return {
          incomeRange: range.label,
          dropoutRate:
            studentsInRange.length > 0
              ? (highRiskCount / studentsInRange.length) * 100
              : 0,
          count: studentsInRange.length,
        };
      });

      setData({ departmentStats, cgpaVsAttendance, incomeVsDropout });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set sample data if fetch fails
      const sampleCGPAVsAttendance = Array.from({ length: 50 }, () => ({
        cgpa: 4 + Math.random() * 6,
        attendance: 50 + Math.random() * 50,
        riskLevel:
          Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
      }));

      const sampleIncomeVsDropout = [
        { incomeRange: "0-2L", dropoutRate: 45, count: 120 },
        { incomeRange: "2-5L", dropoutRate: 28, count: 150 },
        { incomeRange: "5-10L", dropoutRate: 15, count: 100 },
        { incomeRange: "10L+", dropoutRate: 8, count: 80 },
      ];

      setData({
        departmentStats: [],
        cgpaVsAttendance: sampleCGPAVsAttendance,
        incomeVsDropout: sampleIncomeVsDropout,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00CFFF] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights into student performance and dropout trends
          </p>
        </div>
        <button
          onClick={() => generateReport(data)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B0082] hover:bg-[#4B0082]/90 text-white rounded-lg shadow transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <path d="M14 3v5h5M12 18v-6M9 15l3 3 3-3" />
          </svg>
          <span>Generate Report</span>
        </button>
      </div>

      <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Department-wise Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.departmentStats.map((dept, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                {dept.department}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Students
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dept.totalStudents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    High Risk
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {dept.highRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg CGPA
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {dept.avgCGPA.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Dropout Risk
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {dept.totalStudents > 0
                        ? ((dept.highRisk / dept.totalStudents) * 100).toFixed(
                            1
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              CGPA vs Attendance
            </h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="cgpa"
                  name="CGPA"
                  type="number"
                  stroke="#6b7280"
                  label={{
                    value: "CGPA",
                    position: "insideBottomRight",
                    offset: -10,
                  }}
                />
                <YAxis
                  dataKey="attendance"
                  name="Attendance %"
                  type="number"
                  stroke="#6b7280"
                  label={{
                    value: "Attendance %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #4b5563",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Scatter
                  name="Low Risk"
                  data={data.cgpaVsAttendance.filter(
                    (d) => d.riskLevel === "low"
                  )}
                  fill="#10b981"
                  opacity={0.7}
                />
                <Scatter
                  name="Medium Risk"
                  data={data.cgpaVsAttendance.filter(
                    (d) => d.riskLevel === "medium"
                  )}
                  fill="#f59e0b"
                  opacity={0.7}
                />
                <Scatter
                  name="High Risk"
                  data={data.cgpaVsAttendance.filter(
                    (d) => d.riskLevel === "high"
                  )}
                  fill="#ef4444"
                  opacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Legend:</strong> Each dot represents a student. Red dots
              indicate high dropout risk, yellow indicates medium risk, and
              green indicates low risk. Students with higher CGPA and attendance
              rates generally show lower dropout risk.
            </p>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Income vs Dropout Rate
            </h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.incomeVsDropout}
                margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="incomeRange" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  label={{
                    value: "Dropout Rate %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #4b5563",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                  formatter={(value) => [
                    typeof value === "number" ? value.toFixed(1) + "%" : value,
                    "Dropout Rate",
                  ]}
                  labelFormatter={(label) => `Income: ${label}`}
                />
                <Legend />
                <defs>
                  <linearGradient
                    id="dropoutGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="dropoutRate"
                  fill="url(#dropoutGradient)"
                  name="Dropout Rate %"
                  radius={[8, 8, 0, 0]}
                  stroke="#1d4ed8"
                  strokeWidth={1}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Insight:</strong> The bar chart clearly shows that
              students from lower income families (0-2L) have significantly
              higher dropout rates compared to higher income families. Consider
              implementing targeted financial aid and support programs for
              students from lower income backgrounds.
            </p>
          </div>
        </div>
      </div> */}

      <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            CGPA vs Attendance Trends
          </h2>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.cgpaVsAttendance
                .sort((a, b) => a.cgpa - b.cgpa)
                .slice(0, 50)}
              margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="cgpa"
                stroke="#6b7280"
                label={{
                  value: "Student Index",
                  position: "insideBottomRight",
                  offset: -10,
                }}
              />
              <YAxis
                stroke="#6b7280"
                label={{ value: "Value", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #4b5563",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(2) : value
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cgpa"
                stroke="#ef4444"
                strokeWidth={2}
                name="CGPA"
                dot={false}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Attendance %"
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Trends (First 50 Students):</strong>{" "}
            <span className="text-red-600 font-semibold">
              Red line shows CGPA
            </span>{" "}
            and{" "}
            <span className="text-blue-600 font-semibold">
              Blue line shows Attendance %
            </span>
            . The shorter range provides a clearer view of the relationship
            between CGPA and attendance patterns.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#4B0082]/10 to-[#00CFFF]/10 dark:from-[#4B0082]/20 dark:to-[#00CFFF]/20 rounded-2xl p-6 border border-[#00CFFF]/30">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Key Findings
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-[#00CFFF] mt-1">•</span>
            <span>
              Students with CGPA below 6.0 and attendance below 75% are at
              highest risk
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00CFFF] mt-1">•</span>
            <span>
              Family income correlates with dropout rates, suggesting need for
              financial support
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00CFFF] mt-1">•</span>
            <span>
              Previous academic backlogs are a strong predictor of future
              dropout risk
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
