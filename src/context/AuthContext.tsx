import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "client" | "staff";

export interface AuthUser {
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  appCode?: string;
}

// Hardcoded client credentials (Ifcs111-999 with Matoshi111-999)
const CLIENT_CREDENTIALS: Record<string, { password: string; displayName: string }> = {};
for (let i = 1; i <= 9; i++) {
  CLIENT_CREDENTIALS[`Ifcs${i}${i}${i}`] = { password: `Matoshi${i}${i}${i}`, displayName: `Client ${i}` };
}

// Hardcoded staff credentials
const STAFF_CREDENTIALS: Record<string, string> = {
  IFCSstaff: "staffpass2024",
};

interface AuthContextType {
  user: AuthUser | null;
  loginClient: (username: string, password: string) => boolean;
  loginStaff: (username: string, password: string) => boolean;
  signupClient: (data: SignupData) => void;
  logout: () => void;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  appCode?: string;
}

// In-memory registered clients (session only)
const registeredClients: Record<string, { password: string; data: SignupData }> = {};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const loginClient = (username: string, password: string): boolean => {
    // Check hardcoded credentials
    const cred = CLIENT_CREDENTIALS[username];
    if (cred && cred.password === password) {
      setUser({ username, role: "client" });
      return true;
    }
    // Check registered clients
    const reg = registeredClients[username];
    if (reg && reg.password === password) {
      setUser({
        username,
        role: "client",
        firstName: reg.data.firstName,
        lastName: reg.data.lastName,
        email: reg.data.email,
        gender: reg.data.gender,
        appCode: reg.data.appCode,
      });
      return true;
    }
    return false;
  };

  const loginStaff = (username: string, password: string): boolean => {
    // Check dedicated staff credentials
    const pass = STAFF_CREDENTIALS[username];
    if (pass && pass === password) {
      setUser({ username, role: "staff" });
      return true;
    }
    // Also allow client credentials to login as staff
    const cred = CLIENT_CREDENTIALS[username];
    if (cred && cred.password === password) {
      setUser({ username, role: "staff", firstName: cred.displayName });
      return true;
    }
    return false;
  };

  const signupClient = (data: SignupData) => {
    registeredClients[data.email] = { password: data.password, data };
    setUser({
      username: data.email,
      role: "client",
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gender: data.gender,
      appCode: data.appCode,
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginClient, loginStaff, signupClient, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
