"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token and hydrated user data on mount
    const token = localStorage.getItem("quizlm_token");
    const storedUser = localStorage.getItem("quizlm_user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("quizlm_token", token);
    localStorage.setItem("quizlm_user", JSON.stringify(userData));
    // Set cookie so Next.js middleware can detect auth state
    document.cookie = `quizlm_token=${token}; path=/; max-age=${60 * 60 * 72}; SameSite=Lax`;
    setUser(userData);
    router.push("/overview");
  };

  const logout = () => {
    localStorage.removeItem("quizlm_token");
    localStorage.removeItem("quizlm_user");
    // Clear the auth cookie
    document.cookie = "quizlm_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
