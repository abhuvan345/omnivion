import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { useAuth } from "../hooks/useAuth";
import { api, Student } from "../lib/api";
import { calculateDropoutRisk } from "../utils/dropoutCalculation";
import {
  Users,
  TrendingDown,
  Award,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  dropoutRisk: number;
  averageCGPA: number;
  averageAttendance: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    dropoutRisk: 0,
    averageCGPA: 0,
    averageAttendance: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    try {
      let students: Student[] = [];

      // Fetch students based on user role
      if (user?.role === "admin") {
        students = await api.getAllStudents();
      } else if (user?.role === "hod") {
        students = await api.getDepartmentStudents();
      } else if (user?.role === "teacher") {
        students = await api.getClassStudents();
      }

      const totalStudents = students?.length || 0;
      const avgCGPA =
        totalStudents > 0
          ? students.reduce((sum, s) => sum + Number(s.cgpa || 0), 0) /
            totalStudents
          : 0;
      const avgAttendance =
        totalStudents > 0
          ? students.reduce(
              (sum, s) => sum + Number(s.attendance_rate || 0),
              0
            ) / totalStudents
          : 0;

      // Calculate risk distribution using comprehensive dropout prediction
      const riskCounts = {
        high: 0,
        medium: 0,
        low: 0,
      };

      let totalRiskScore = 0;

      students?.forEach((s: Student) => {
        const riskPercentage = calculateDropoutRisk(s);
        totalRiskScore += riskPercentage;

        if (riskPercentage >= 70) {
          riskCounts.high++;
        } else if (riskPercentage >= 40) {
          riskCounts.medium++;
        } else {
          riskCounts.low++;
        }
      });

      // Average dropout risk across all students
      const dropoutRisk =
        totalStudents > 0 ? totalRiskScore / totalStudents : 0;

      setStats({
        totalStudents,
        dropoutRisk,
        averageCGPA: avgCGPA,
        averageAttendance: avgAttendance,
        highRiskCount: riskCounts.high,
        mediumRiskCount: riskCounts.medium,
        lowRiskCount: riskCounts.low,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpiCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      change: "+12%",
      positive: true,
    },
    {
      title: "Dropout Risk",
      value: `${stats.dropoutRisk.toFixed(1)}%`,
      icon: TrendingDown,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      change: "-5%",
      positive: true,
    },
    {
      title: "Average CGPA",
      value: stats.averageCGPA.toFixed(2),
      icon: Award,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      change: "+0.3",
      positive: true,
    },
    {
      title: "Avg Attendance",
      value: `${stats.averageAttendance.toFixed(1)}%`,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      change: "+2%",
      positive: true,
    },
  ];

  const riskDistribution = [
    {
      level: "High Risk",
      count: stats.highRiskCount,
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      percentage: (stats.totalStudents > 0
        ? (stats.highRiskCount / stats.totalStudents) * 100
        : 0
      ).toFixed(1),
    },
    {
      level: "Medium Risk",
      count: stats.mediumRiskCount,
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      percentage: (stats.totalStudents > 0
        ? (stats.mediumRiskCount / stats.totalStudents) * 100
        : 0
      ).toFixed(1),
    },
    {
      level: "Low Risk",
      count: stats.lowRiskCount,
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      percentage: (stats.totalStudents > 0
        ? (stats.lowRiskCount / stats.totalStudents) * 100
        : 0
      ).toFixed(1),
    },
  ];

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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your student analytics overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    card.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.positive ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  {card.change}
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Risk Distribution
            </h2>
          </div>

          <div className="space-y-4">
            {riskDistribution.map((item, index) => (
              <div key={index} className={`p-4 rounded-xl ${item.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${item.textColor}`}>
                    {item.level}
                  </span>
                  <span className={`text-lg font-bold ${item.textColor}`}>
                    {item.count}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("students")}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-[#4B0082] to-[#00CFFF] text-white font-semibold hover:shadow-lg hover:shadow-[#00CFFF]/50 transition-all duration-300"
            >
              View High-Risk Students
            </button>
            <button
              onClick={() => navigate("analytics")}
              className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              Generate Report
            </button>
            {user?.role === "teacher" && (
              <button
                onClick={() => navigate("upload")}
                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Upload New Data
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#4B0082]/10 to-[#00CFFF]/10 dark:from-[#4B0082]/20 dark:to-[#00CFFF]/20 rounded-2xl p-6 border border-[#00CFFF]/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#00CFFF]/20">
            <AlertTriangle className="w-6 h-6 text-[#00CFFF]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Action Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {stats.highRiskCount} students identified as high-risk. Consider
              scheduling intervention meetings with at-risk students to improve
              retention rates.
            </p>
            <button
              onClick={() => navigate("students")}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
