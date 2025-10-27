import { ReactNode, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Upload,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.svg";
import { NavigationProvider } from "../contexts/NavigationContext";
import UserProfileHeader from "./UserProfileHeader";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
}: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      page: "dashboard",
      roles: ["admin", "hod", "teacher"],
    },
    {
      name: "Analytics",
      icon: BarChart3,
      page: "analytics",
      roles: ["admin", "hod", "teacher"],
    },
    {
      name: "Students",
      icon: Users,
      page: "students",
      roles: ["admin", "hod", "teacher"],
    },
    { name: "Upload Data", icon: Upload, page: "upload", roles: ["teacher"] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    profile?.role ? item.roles.includes(profile.role) : false
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] transition-colors duration-300">
      <NavigationProvider currentPage={currentPage} navigate={onNavigate}>
        <div className="lg:hidden fixed top-0 right-0 z-50 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/80 dark:bg-[#2A2A2A]/80 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <aside
          className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/70 dark:bg-[#2A2A2A]/70 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#00CFFF] flex items-center justify-center shadow-lg shadow-[#00CFFF]/30 overflow-hidden">
                  <img src={logo} alt="Omnivion logo" className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#00CFFF] bg-clip-text text-transparent">
                    Omnivion
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Predictive Analytics
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </div>
                <nav className="space-y-1">
                  {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;
                    return (
                      <button
                        key={item.page}
                        onClick={() => {
                          onNavigate(item.page);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-[#4B0082] to-[#00CFFF] text-white shadow-lg shadow-[#00CFFF]/30"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="mb-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B0082] to-[#00CFFF] flex items-center justify-center text-white font-bold">
                    {profile?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {profile?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {profile?.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span className="text-sm">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="lg:ml-64">
          <UserProfileHeader />
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </NavigationProvider>
    </div>
  );
}
