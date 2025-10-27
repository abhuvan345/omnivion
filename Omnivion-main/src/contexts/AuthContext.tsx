import { createContext, useEffect, useState, ReactNode } from "react";
import {
  api,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  User as ApiUser,
} from "../lib/api";

interface AuthContextType {
  user: ApiUser | null;
  profile: ApiUser | null; // Keep profile for compatibility with existing components
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a stored session
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          setProfile(userData); // Set profile to same as user for compatibility
        } catch (error) {
          console.error("Failed to verify token:", error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const authResponse = await api.login(email, password);

      // Set the token
      setAuthToken(authResponse.token);

      // Get full user details
      const fullUserData = await api.getCurrentUser();

      setUser(fullUserData);
      setProfile(fullUserData); // Set profile to same as user for compatibility
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
