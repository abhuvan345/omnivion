import { useAuth } from "../hooks/useAuth";
import { LogOut, User } from "lucide-react";

export default function UserProfileHeader() {
  const { user, profile, signOut } = useAuth();

  if (!user && !profile) {
    return null;
  }

  const displayName = user?.name || profile?.name || "User";
  const displayRole = user?.role || profile?.role || "Unknown";
  const displayDepartment = user?.department || profile?.department || "N/A";
  const displayEmail = user?.email || profile?.email || "N/A";

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "hod":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "teacher":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Admin";
      case "hod":
        return "Head of Department";
      case "teacher":
        return "Teacher";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - User Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4B0082] to-[#00CFFF] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(
                    displayRole
                  )}`}
                >
                  {getRoleLabel(displayRole)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {displayDepartment} • {displayEmail}
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="View profile"
            >
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to sign out?")) {
                  signOut();
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
