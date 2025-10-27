import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserPlus, AlertCircle } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "hod" | "teacher";
  department?: string;
}

export default function AdminPage() {
  const [users] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const { user } = useAuth();

  // available departments (keep in sync with DB)
  const departments = [
    "ARTS",
    "BIOLOGY",
    "CIVIL",
    "COMMERCE",
    "ELECTRONICS",
    "COMPUTER SCIENCE",
    "MECHANICAL",
  ];

  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"hod" | "teacher" | "admin">("hod");
  const [departmentInput, setDepartmentInput] = useState<string>(
    departments[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize with empty users - backend endpoint needed for real data
    setLoading(false);
    // TODO: Fetch users from API when backend endpoint is available
    // In production: GET /api/auth/users or /api/users
  }, []);

  const getRoleBadge = (roleParam: string) => {
    switch (roleParam) {
      case "admin":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            Admin
          </span>
        );
      case "hod":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            HOD
          </span>
        );
      case "teacher":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Teacher
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Enforce role rules on client
    if (user?.role === "admin" && role !== "hod") {
      setError("Admins can only create HOD users.");
      return;
    }
    if (user?.role === "hod" && role !== "teacher") {
      setError("HODs can only create Teacher users.");
      return;
    }

    try {
      setSubmitting(true);

      // Call backend API to create user
      // TODO: Create POST /api/auth/create-user endpoint in backend
      // Example: const response = await fetch('/api/auth/create-user', { ... })

      // For now, show a message
      setError("Backend endpoint needed: POST /api/auth/create-user");
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error creating user:", errorMessage);
      setError("Failed to create user. Backend support needed.");
    } finally {
      setSubmitting(false);
    }
  };

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
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users and system configuration
          </p>
        </div>
        <button
          onClick={() => {
            // initialize form defaults depending on current user's role
            if (user?.role === "admin") {
              setRole("hod");
              setDepartmentInput(departments[0]);
            } else if (user?.role === "hod") {
              setRole("teacher");
              setDepartmentInput(user.department || departments[0]);
            }
            setFullName("");
            setEmail("");
            setPassword("");
            setError("");
            setShowAddUser(true);
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4B0082] to-[#00CFFF] text-white font-semibold hover:shadow-lg hover:shadow-[#00CFFF]/50 transition-all duration-300 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          User Management
        </h2>

        {users.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No users to display. Backend API endpoint needed to fetch users
              list.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Implement: GET /api/auth/users endpoint in backend
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr
                    key={userItem.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B0082] to-[#00CFFF] flex items-center justify-center text-white font-bold">
                          {userItem.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {userItem.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {userItem.email}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(userItem.role)}</td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {userItem.department || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add New User
            </h3>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] outline-none"
                  placeholder="john@college.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={
                    role === "hod"
                      ? "HOD"
                      : role === "teacher"
                      ? "Teacher"
                      : "Admin"
                  }
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#111111] text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                {user?.role === "hod" ? (
                  <input
                    value={departmentInput}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#111111] text-gray-900 dark:text-white outline-none"
                  />
                ) : (
                  <select
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00CFFF] outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#4B0082] to-[#00CFFF] text-white font-semibold hover:shadow-lg hover:shadow-[#00CFFF]/50 transition-all duration-300 disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
