import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "client" | "staff" | "guest";

export interface AuthUser {
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  appCode?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  appCode?: string;
}

// Staff credentials remain hardcoded
const STAFF_CREDENTIALS: Record<string, string> = {
  IFCSstaff: "staffpass2024",
};

interface AuthContextType {
  user: AuthUser | null;
  loginClient: (username: string, password: string) => Promise<boolean>;
  loginStaff: (username: string, password: string) => boolean;
  loginGuest: (email: string) => void;
  signupClient: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("tfcs_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("tfcs_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tfcs_user");
    }
  }, [user]);

  const loginClient = async (username: string, password: string): Promise<boolean> => {
    // Check DB for client account by email
    const { data } = await (supabase as any)
      .from("client_accounts")
      .select("*")
      .eq("email", username)
      .single();

    if (data && data.password_hash === password) {
      setUser({
        username: data.email,
        role: "client",
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        gender: data.gender,
        appCode: data.app_code,
      });
      return true;
    }
    return false;
  };

  const loginStaff = (username: string, password: string): boolean => {
    const pass = STAFF_CREDENTIALS[username];
    if (pass && pass === password) {
      setUser({ username, role: "staff" });
      return true;
    }
    return false;
  };

  const loginGuest = (email: string) => {
    setUser({ username: email, role: "guest", email });
  };

  const signupClient = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    // Check if email already exists
    const { data: existing } = await (supabase as any)
      .from("client_accounts")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const { error } = await (supabase as any)
      .from("client_accounts")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password_hash: data.password,
        gender: data.gender,
        app_code: data.appCode || null,
      });

    if (error) {
      return { success: false, error: "Failed to create account. Please try again." };
    }

    setUser({
      username: data.email,
      role: "client",
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gender: data.gender,
      appCode: data.appCode,
    });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginClient, loginStaff, loginGuest, signupClient, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
