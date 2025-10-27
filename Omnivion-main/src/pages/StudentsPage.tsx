import { useEffect, useState, useCallback } from "react";
import { api, Student } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import {
  calculateDropoutRisk,
  getRiskColor,
} from "../utils/dropoutCalculation";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function StudentsPage() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Student | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [scholarshipFilter, setScholarshipFilter] = useState<string>("all");

  // Helper functions to decode categorical variables
  const getGender = (student: Student): string => {
    switch (student.gender) {
      case 0:
        return "Female";
      case 1:
        return "Male";
      case 2:
        return "Other";
      default:
        return "Unknown";
    }
  };

  const getDepartment = (student: Student): string => {
    switch (student.department) {
      case 0:
        return "ARTS";
      case 1:
        return "BIOLOGY";
      case 2:
        return "CIVIL";
      case 3:
        return "COMMERCE";
      case 4:
        return "COMPUTER SCIENCE";
      case 5:
        return "ELECTRONICS";
      case 6:
        return "MECHANICAL";
      default:
        return "Unknown";
    }
  };

  const getScholarship = (student: Student): string => {
    switch (student.scholarship) {
      case 0:
        return "No";
      case 1:
        return "Partial";
      case 2:
        return "Yes";
      default:
        return "Unknown";
    }
  };

  const getExtraCurricular = (student: Student): string => {
    switch (student.extra_curricular) {
      case 0:
        return "No";
      case 1:
        return "Yes";
      default:
        return "Unknown";
    }
  };

  const getSportsParticipation = (student: Student): string => {
    switch (student.sports_participation) {
      case 0:
        return "No";
      case 1:
        return "Yes";
      default:
        return "Unknown";
    }
  };

  const getParentalEducation = (student: Student): string => {
    switch (student.parental_education) {
      case 0:
        return "High School";
      case 1:
        return "Bachelor's";
      case 2:
        return "Master's";
      default:
        return "Unknown";
    }
  };

  const fetchStudents = useCallback(async () => {
    try {
      let studentsData: Student[] = [];

      // Fetch students based on user role
      if (profile?.role === "admin") {
        studentsData = await api.getAllStudents();
      } else if (profile?.role === "hod") {
        studentsData = await api.getDepartmentStudents();
      } else {
        studentsData = await api.getClassStudents();
      }

      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [profile?.role]);

  // Filter and sort function
  const filterAndSortStudents = useCallback(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.student_id
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          getDepartment(student)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          getGender(student).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (student) => getDepartment(student) === departmentFilter
      );
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter(
        (student) => getGender(student) === genderFilter
      );
    }

    // Apply scholarship filter
    if (scholarshipFilter !== "all") {
      filtered = filtered.filter(
        (student) => getScholarship(student) === scholarshipFilter
      );
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    setFilteredStudents(filtered);
  }, [
    students,
    searchQuery,
    departmentFilter,
    genderFilter,
    scholarshipFilter,
    sortField,
    sortDirection,
  ]);

  // Handle sort
  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get unique departments and genders for filter options
  const uniqueDepartments = [
    ...new Set(
      students.map((s) => getDepartment(s)).filter((dept) => dept !== "Unknown")
    ),
  ];
  const uniqueGenders = [
    ...new Set(
      students.map((s) => getGender(s)).filter((gender) => gender !== "Unknown")
    ),
  ];

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    filterAndSortStudents();
  }, [filterAndSortStudents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00CFFF] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor student performance and risk levels
          </p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by student ID, department, or gender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] focus:border-transparent outline-none"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] focus:border-transparent outline-none"
            >
              <option value="all">All Genders</option>
              {uniqueGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={scholarshipFilter}
              onChange={(e) => setScholarshipFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] focus:border-transparent outline-none"
            >
              <option value="all">All Scholarships</option>
              <option value="Yes">With Scholarship</option>
              <option value="No">No Scholarship</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("student_id")}
                >
                  <div className="flex items-center gap-2">
                    Student ID
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">Department</div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">Gender</div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("age")}
                >
                  <div className="flex items-center gap-2">
                    Age
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("cgpa")}
                >
                  <div className="flex items-center gap-2">
                    CGPA
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("attendance_rate")}
                >
                  <div className="flex items-center gap-2">
                    Attendance
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("family_income")}
                >
                  <div className="flex items-center gap-2">
                    Family Income
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("past_failures")}
                >
                  <div className="flex items-center gap-2">
                    Past Failures
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("study_hours_per_week")}
                >
                  <div className="flex items-center gap-2">
                    Study Hours/Week
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("assignments_submitted")}
                >
                  <div className="flex items-center gap-2">
                    Assignments
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("projects_completed")}
                >
                  <div className="flex items-center gap-2">
                    Projects
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => handleSort("total_activities")}
                >
                  <div className="flex items-center gap-2">
                    Activities
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">Scholarship</div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">Dropout Risk %</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student: Student) => (
                <tr
                  key={student._id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {student.student_id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {getDepartment(student)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {getGender(student)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.age ?? "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {student.cgpa ? Number(student.cgpa).toFixed(2) : "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {student.attendance_rate
                        ? Number(student.attendance_rate).toFixed(1) + "%"
                        : "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.family_income
                        ? `₹${Number(student.family_income).toLocaleString()}`
                        : "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.past_failures ?? "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.study_hours_per_week
                        ? Number(student.study_hours_per_week).toFixed(1)
                        : "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.assignments_submitted ?? "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.projects_completed ?? "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {student.total_activities ?? "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {getScholarship(student)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${getRiskColor(
                        calculateDropoutRisk(student)
                      )}`}
                    >
                      {calculateDropoutRisk(student)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No students found matching your criteria
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      </div>
    </div>
  );
}
